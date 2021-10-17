### Created By: hel_leen
### Year: 2021
### Open source under the MIT License.


library(spotifyr)
library(knitr)
library(ggjoy)
library(dplyr)
library(stringi)


Sys.setenv(SPOTIFY_CLIENT_ID = '88af1a508b584cdbb46cd466c2b0b237')
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
    
    results=
      tibble(cover=NA,artist=NA,album=NA,artist.link=NA,album.link=NA,track=NA,genre=NA,type=NA,rank=NA,update=NA)
    
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
        zoo::na.locf %>%
        filter(V2!='') %>% 
        add_column(
          cover=
            page %>% 
            html_elements('.cover') %>% 
            sapply(.,function(i) str_extract(i,'(?<=src=\\").*(?=\\"\\stitle)') ),
          .before='V1'
        ) %>% 
        mutate(
          update=date[i]
        ) %>% 
        # rename( c("artist" = "V1","album" = "V2","track" = "V3",)) %>% 
        select(!starts_with("V")) %>% 
        mutate(across(where(is.character),~str_replace_all(.x,'"',"'"))) 
      
      results %<>% 
        add_row(
          entries
        ) %>% 
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
