### Created By: hel_leen
### Year: 2021
### Open source under the MIT License.


library(spotifyr)
library(knitr)
library(ggjoy)
library(dplyr)
library(stringi)
library(zoo)


Sys.setenv(SPOTIFY_CLIENT_ID = '')
Sys.setenv(SPOTIFY_CLIENT_SECRET = '') # crossed out
access_token = get_spotify_access_token()

get_artist_info = 
  function(artist) {
    get_artist_audio_features(artist) %>% 
      .$artist_id %>% .[1] %>% get_artist() %>% .[c("genres", "id", "images")]
  }
get_lastest_date = 
  function(artist) {
    get_artist_audio_features(artist) %>% 
      .$artist_id %>% .[1] %>% get_artist_albums() %>% .$release_date %>% .[1]
  }

everynoise =
  function(link) {
    date=
      link %>%
      read_html() %>% 
      html_elements('select[name="date"]>option') %>% 
      html_text()
    
    results = tibble(cover=NA,artist=NA,album=NA)
    
    i = 1
    while (i <= 1) {
      # while (i <= length(date)) {
      page =
        link %>%
        paste0(.,'&date=',date[i]) %>% 
        read_html() 
      
      entries=
        page %>% 
        html_elements('td') %>% 
        .[str_which(.,'checkbox|genrecell')] %>% 
        .[-1] %>% 
        .[-str_which(.,'genrecell\\"\\>\\s\\</')] %>% 
        sapply(.,function(i) html_elements(i,'a,.trackcount'))%>% 
        stri_list2matrix %>% 
        t %>% 
        as_tibble() %>% 
        mutate(
          V2=case_when(
            (str_detect(V2,'addlink'))~'',
            TRUE~V2
          ),
          genre=case_when(
            (str_detect(V1,'genre\\=')|is.na(V2))~ 
              str_extract(V1,'(?<=\\>).*(?=\\<)') %>% str_to_title,
          ), 
          track= case_when(
            (str_detect(V1,'artist')&is.na(V3))~1,
            TRUE~ str_extract(V3,'\\d+') %>% as.numeric
          ),
          type=str_extract(V2,'(?<=class=\\"rt).*?(?=\\")') %>% str_to_title,
          artist = str_remove(V1,"([^>]*>)") %>% str_remove_all('<[/ai]+>'),
          artist.link = str_extract(V1,'(?<=spotify\\:)(.*?)(?=\\")'),
          album = str_remove(V2,"([^>]*>)") %>% str_remove_all('<[/ai]+>'),
          album.link = str_extract(V2,'(?<=spotify\\:)(.*?)(?=\\")'),
          rank=str_extract(V1,'(?<=rank\\s)(.*?)(?=\\")') %>% str_remove_all(',') %>% as.numeric,
          V3='',
        ) %>% 
        na.locf %>%
        filter(V2!='') %>% 
        add_column(
          cover=
            page %>% 
            html_elements('.cover') %>% 
            sapply(.,function(i) str_extract(i,'(?<=image\\/).*(?=\\"\\stitle)') ),
          .before='V1'
        ) %>% 
        mutate(
          update=date[i] %>% str_replace_all('(\\d{2})(\\d{2})$','-\\1-\\2')
        ) %>% 
        # rename( c("artist" = "V1","album" = "V2","track" = "V3",)) %>% 
        select(!starts_with("V")) %>% 
        mutate(across(where(is.character),~str_replace_all(.x,'"',"'"))) 
      
      extra = 
        entries %>% 
        (function(df) {
          related =
            df %>% distinct_at('artist.link')  %>%
            pull %>%
            map(function(x) x %>% str_extract('(?<=artist\\:).*') %>%
                  get_related_artists() %>% .[c("name", "id")]  ) %>%
            tibble(related=.) %>%
            unnest_wider(related) %>%
            rename(c("related.artist" = "name","related.artist.id" = "id"))
          
          bandinfo=
            df %>%
            distinct_at('artist.link')  %>% 
            pull %>% 
            map(function(x) x %>% str_extract('(?<=artist\\:).*') %>% 
                  get_artist() %>% .[c("genres", "followers")])  %>% 
            tibble (bandinfo=.) %>% 
            unnest_wider(bandinfo)
          
          albuminfo=
            df %>%
            distinct_at('album.link')  %>% 
            pull %>% 
            map(function(x) x %>% str_extract('(?<=album\\:).*') %>% 
                  get_album() %>% .[c("release_date", "label","tracks")] %>% 
                  sapply(., function(x){
                    if ("items" %in% names(x) )                    
                    { return(x=x%>%.$items %>% .$duration_ms %>% sum )} 
                    else 
                    {return(x=paste0(x))}
                    x
                  }))  %>% 
            tibble (albuminfo=.) %>% 
            unnest_wider(albuminfo)  %>% 
            rename(c("length" = "tracks")) 
          
          list(
            band =
              add_column(bandinfo,related, df %>% distinct_at('artist.link')) %>% 
              mutate(
                across(starts_with('related')|c(genres), 
                       ~ str_replace_all(.x, c('(^c\\()|\\s?\\)$|\\"'='',"NULL"='' )) ),
                across(c(followers), ~ str_extract(.x, '\\d+' ) )
              ),
            album =
              add_column(albuminfo,df %>% distinct_at('album.link'))  
          )
          
        })(.)
      entries %<>% 
        left_join(extra$band) %>% 
        left_join(extra$album)  
      
      results %<>% 
        full_join(entries) %>% 
        drop_na(album) 
      
      i = i+1
    }
    
    return(results)
  }
noise.today = lubridate::today(tzone = "UTC") %>% 
  paste0('noise.',.) %>% 
  str_replace_all('-','')
noise %<>% 
  union(
    noise.today %>% parse(text = .) %>% eval()
  ) 
