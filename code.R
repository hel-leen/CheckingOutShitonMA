### Created By: hel_leen
### Year: 2021
### Open source under the MIT License.


library(magrittr)
library(tidyr)
library(dplyr)
library(purrr)
library(tibble)
library(readr)
library(stringr)
library(ggplot2)
library(rvest)
library(lubridate)
library(magick)
library(crayon)
library(gert)
library(stringi)
# 
# library(zoo)
# library(imager)
# library(ggthemr)
# library(colorDF)
save.image("../all.RData")
##########################  check out new releases  #################################


malink = 
  "https://www.metal-archives.com"

localize =
  \(url){
    on.exit(closeAllConnections())
    download.file(url,destfile = "temp.html", quiet=TRUE)
    read_html("temp.html",encoding='UTF-8')
  }

addnew = 
  \(x,y,by="album.link"){
    anti_join(
      by = c(by),
      y = y,
      x = (
        x %>%  
          distinct_at(vars(by),.keep_all = TRUE)))  
  }

checkout =  
  function (link) {
    
    ajax.page = 
      link %>% 
      paste0(.,"000") %>%
      localize() %>% 
      html_elements("body")
    
    count.records =
      ajax.page %>% 
      as.character() %>% 
      str_match('TotalDisplayRecords\\":\\s(\\d*)') %>% 
      .[,2] %>% 
      as.numeric()
    
    album.link.i = NA
    album.title.i = NA
    band.link.i = NA
    band.name.i = NA
    release.info.i = NA
    i=1
    while (i <= (trunc(count.records/100)+1)) {
      if (i == 1) {
        ajax.page = ajax.page
      } else {
        ajax.page = 
          link %>% 
          paste0(.,(i-1),"00") %>%
          localize() %>% 
          html_elements("body")
      }
      
      
      album.link.i.p =
        ajax.page %>% 
        html_elements("a") %>% 
        html_attr("href") %>%  
        str_subset("albums") %>% 
        str_extract('(?<=albums).*(?=\\\\)') %>% 
        str_remove_all('(.*?\\/){3}(?<=\\d?)') %>% 
        as.numeric
      album.link.i = c(album.link.i, album.link.i.p) 
      
      # same as release.info[2]
      # album.title.i.p =
      #   ajax.page %>% 
      #   html_elements("a") %>% 
      #   str_subset("albums") %>%
      #   str_extract('(?<=\\"\\>).*(?=\\</a\\>)')
      # album.title.i = c(album.title.i, album.title.i.p) 
      
      band.link.i.p =
        ajax.page %>% 
        html_children() %>% 
        as.character() %>% 
        str_extract_all("(?<=\\t)[^(\\t)(\\n)]*") %>% 
        unlist() %>%
        .[str_which(.,'href')] %>% 
        .[seq(1, length(.), 2)] %>%
        str_extract_all('\\/band([^\\/]+\\/){2}\\d+(?=%5C%22)|(\\s[\\|\\/]\\s)') %>%
        sapply(str_flatten) %>% 
        str_remove_all('/band([^\\/]+\\/){2}')
      band.link.i = c(band.link.i, band.link.i.p)
      # 
      # band.name.i.p =
      #   ajax.page %>% 
      #   html_elements("a") %>% 
      #   str_extract(".*bands/.*") %>% 
      #   str_extract('(?<=\\>).*(?=\\</a\\>)') %>% 
      #   str_c(";") %>%
      #   str_replace_na() %>%
      #   str_flatten() %>% 
      #   str_split("NA") %>%
      #   .[[1]] %>% 
      #   .[-length(.)] %>% 
      #   str_split(";",simplify = TRUE) %>%
      #   .[,-ncol(.)]
      # 
      # band.name.i = plyr::rbind.fill.matrix(band.name.i, band.name.i.p)
      # 
      # for (j in 1:ncol(band.name.i)) {
      #   band.name.i =  
      #     band.name.i %>% 
      #     as.data.frame() %>% 
      #     mutate(
      #       # .keep = "unused",
      #       "band.name.{j}" := .[,j]
      #     ) 
      # }
      # 
      release.info.i.p =
        ajax.page %>% 
        html_text() %>% 
        str_remove_all('(th|st|nd|rd),|\\s(?=\\n)|\\n|\\t?|\\\\?|(\\"(?=\\"))')  %>% 
        str_remove_all('(\\s{2,})|\\s(?=\\")|(?<=\\")\\s')  %>% 
        str_extract('(?<=\\[\\[\\").*(?=\\"\\]\\])') %>% 
        str_split('(\\"\\],\\[\\")')  %>%
        .[[1]] %>% 
        str_split('\\",(\\")?',simplify = TRUE)
      release.info.i = rbind(release.info.i, release.info.i.p)
      
      i=i+1
    }
    
    
    releases =
      Reduce(
        cbind,
        list(
          release.info.i %>% as.data.frame() %>% 
            transmute(
              album = V2,
              band = V1,
              band.genre = V4,
              album.type = V3,
              album.date = parse_date_time(V5, c('%b %d, %y', '%b, %y', '%y'),
                                           select_formats='%y-%m-%d'),
            ),
          album.link.i %>% as.data.frame() %>% transmute(album.link = (.)),
          band.link.i %>% as.data.frame() %>% transmute(band.link = (.))
        ) 
      ) %>% 
      drop_na(album) %>% 
      distinct_at(vars(album.link),.keep_all = TRUE)
    
    count.distinct = 
      releases %>% 
      distinct_at(vars(album)) %>% 
      nrow()
    
    count.band = 
      releases %>% 
      distinct_at(vars(band)) %>% 
      nrow()
    
    count.black = 
      releases %>% 
      filter(str_detect(band.genre, "Black|black")) %>%
      nrow()
    
    count.death = 
      releases %>% 
      filter(str_detect(band.genre, "Death|death")) %>%
      nrow()
    
    count.fulllength = 
      releases %>% 
      filter(str_detect(album.type, "Full-length")) %>%
      nrow()
    
    list(
      cat(
        '\nBands: ' %+% make_style(rgb(0.53, 0.62, 0.95))(count.band) %+% 
          '\nReleases: ' %+%
          make_style(rgb(0.95, 0.3, 0.65))$underline$bold(count.records) %+%
          '\nDuplicated: ' %+% 
          blurred(yellow((nrow(releases)-count.band)) %+% 
                    '\nFull-length: ' %+%
                    make_style(rgb(0.83, 0.8, 0.45))(count.fulllength) %+% 
                    ('\nBlack metal: ') %+%
                    make_style(rgb(0.93, 0.5, 0.72))$bold(count.black) %+% 
                    ('\nDeath metal: ') %+%
                    make_style(rgb(0.61, 0.8, 0.95))$bold(count.death) %+% 
                    reset(" \n\n")
                  
          )),
      return(releases)
    ) 
  }



# extend every album

extend.album =
  function(ext) {
    album.cover.i = NA
    album.label.i = NA
    album.track.i = NA
    album.duration.i = NA
    release.earliesttime.i = NA
    class(release.earliesttime.i) = "Date"
    i = 1
    while (i <= nrow(ext)) {
      malink = 
        "https://www.metal-archives.com"
      album.page=
        ext$album.link[i] %>%
        paste0(malink,'/release/view/id/',.) %>% 
        # clipr::read_clip() %>%
        localize() %>% 
        html_elements('#cover,
    .band_name, .album_name,  
     #album_tabs>ul,
     dl.float_right, td[align="right"]>strong, tr.displayNone')  
      
      album.cover =
        album.page %>%
        .[str_which(.,'cover')] %>%
        html_nodes("img") %>%
        html_attr("src") %>% 
        str_remove_all(malink)
      if (length(album.cover) == 0) {
        album.cover = '/images/cat.jpg'
      }
      album.cover.i[i] = album.cover
      
      
      album.label =
        album.page %>%
        .[str_which(.,'float_right')] %>%  
        html_children() %>% 
        .[str_which(.,'Label')+1] %>%
        html_elements("a") %>%
        as.character() %>% 
        str_extract_all('\\/(\\d)+?(?=#)|\\"\\>.+(?=\\<\\/)') %>% 
        sapply(str_flatten)
      if(length(album.label) <= 0) { album.label = NA }
      album.label.i[i] = album.label
      
      album.track=
        album.page %>%
        .[str_which(.,'displayNone')] %>% 
        length()
      album.track.i[i] = album.track
      
      
      album.duration=
        album.page %>%
        .[str_which(.,'strong')] %>%
        html_text2()
      if(length(album.duration) <= 0) { album.duration = '00:00:00' }
      album.duration.i[i] = album.duration
      
      
      album.parent =
        album.page %>%
        .[str_which(.,'Other versions')] %>%
        html_children() %>%
        html_elements("a") %>%
        .[str_which(.,'Other versions')] %>%
        html_attr("href")
      
      release.earliestdate = NA
      if (length(album.parent) != 0) {
        release.earliestdate =
          album.parent %>%
          localize() %>%
          html_elements("td>a") %>%
          html_text() %>%
          parse_date_time(c('%b %d, %y', '%b, %y', '%y'),
                          select_formats='%y-%m-%d') %>%
          min()
      }
      release.earliesttime.i[i] = release.earliestdate
      
      i = i+1
    }
    
    extended.albums =
      ext %>% add_column(
        album.cover = album.cover.i,
        album.label = album.label.i,
        album.track = album.track.i,
        data.frame(V1 = album.duration.i %>%  ms(),
                   V2 = album.duration.i %>%  hms()
        ) %>%
          mutate(Duration = coalesce(V1,V2),
                 .keep="unused") %>%
          mutate(
            album.duration = (Duration + parse_date_time2('00:00:00','HMS',
                                                          tz = 'UTC',lt=TRUE)) %>%
              format('%H:%M:%S')
          ) %>% 
          select(album.duration),
        earliest.date = release.earliesttime.i
      )
    
  }

extend.band = 
  function(ext) {
    
    ext.bands =
      ext %>% distinct_at('band.link')
    
    band.related.i = NA
    band.similar.i = NA
    band.country.i = NA
    k=1
    while(k <=nrow(ext.bands)) {
      
      malink = 
        "https://www.metal-archives.com"
      
      band.pages =
        ext.bands$band.link[k] %>%
        str_split('\\s(\\||\\/)\\s') %>% 
        .[[1]] %>% 
        .[str_which(.,'\\d+')] 
      
      
      band.country = NA
      for (j in 1:length(band.pages)) {
        band.country = 
          c(  c(band.country, " || "),
              band.pages[j] %>% 
                paste0(malink,'/bands/view/',.) %>% 
                localize() %>%  
                html_elements("#band_stats>.float_left>dd:nth-of-type(1)>a") %>% 
                as.character()%>% 
                str_extract('(?<=\\"\\>).*(?=\\</a\\>)')
          )
      }
      band.country = band.country[-c(1, 2)]  %>% str_flatten('|')
      band.country.i[k] = band.country
      
      band.related = NA
      for (j in 1:length(band.pages)) {
        band.related = 
          c(  c(band.related, " || "),
              band.pages[j] %>% 
                paste0(malink,'/bands/view/',.) %>% 
                localize() %>%  
                html_elements(".lineupBandsRow>td>a") %>% 
                as.character() %>% 
                str_extract('\\/\\d+?(?=\\"\\>).*(?=\\</a\\>)') %>% 
                sort() %>% 
                unique()
          )
      }
      band.related = band.related[-c(1, 2)]  %>% str_flatten('|')
      band.related.i[k] = band.related
      
      band.similar = NA
      for (j in 1:length(band.pages)) {
        band.similar = 
          c(  c(band.similar, " || "),
              band.pages[j] %>% 
                paste0(
                  malink,
                  '/band/ajax-recommendations/id/',
                  .,
                  '/showMoreSimilar/1/'
                ) %>% 
                localize() %>%  
                html_elements('tr:not(:nth-last-child(1))>td:nth-child(1)') %>% 
                as.character() %>% 
                str_extract('\\/\\d+?(?=\\"\\>).*(?=\\</a\\>)')
          )
      }
      band.similar = band.similar[-c(1, 2)]  %>% str_flatten('|')
      band.similar.i[k] = band.similar
      
      k = k+1
      
    }
    
    extended.bands =
      ext.bands %>% add_column(
        band.country = band.country.i,
        band.similar = band.similar.i,
        band.related = band.related.i
      ) 
  }





## generate new data based on current album.date

upcoming =
  function(){
    toDay = lubridate::today(tzone = "UTC")
    theDate = toDay %>% str_split('-') %>% .[[1]]
    theYear = theDate %>% .[1]
    theMonth = theDate %>% .[2]
    theDay = theDate %>% .[3]
    if(theDay == 1 & theMonth >1) {
      fromDate = toDay - months(1)
      toDate = toDay - days(1)
    } else {
      fromDate = toDay
    }
    toDate = '0000-00-00'
    paste0(
      "https://www.metal-archives.com/release/ajax-upcoming/json/1?sEcho=1&fromDate=",
      fromDate,
      "&toDate=",
      toDate,
      "&includeVersions=0&iDisplayStart="
    )
  }

releases.today = 
  lubridate::today(tzone = "UTC") %>% 
  paste0('releases-',.) %>% 
  str_replace_all('-','.')
assign(releases.today, checkout(upcoming()))


new = 
  releases.today %>% parse(text = .) %>% eval() %>% 
  addnew(.,new.list)

cat('\n ' %+% make_style(rgb(0.88, 0.6, 0.75))(nrow(new)) %+% 
      ' releases to be added. \n')

while((nrow(new) > 0) ) {
  new.extended.album = extend.album(new %>% slice(1))
  new.extended.band =  extend.band (new %>% slice(1))
  
  new.list %<>% 
    union(
      left_join(new.extended.album, 
                new.extended.band)
    ) %>% 
    mutate(
      index = row_number()
    )   %>%   
    arrange(desc(index)) %>% 
    distinct_at(vars(album.link),.keep_all = TRUE) %>% 
    arrange((index)) %>% 
    select(!index)
  
  new =  
    releases.today %>% parse(text = .) %>% eval() %>% 
    addnew(.,new.list)
}



## stylish the value name a bit and generate a web page 
export.data = 
  \(dataname) { 
    dataname %>%
      # filtering records
      arrange(desc(album.link)) %>% 
      filter(album.date > Sys.Date() - days(183) & album.date < Sys.Date() + days(183)) %>%
      filter(is.na(earliest.date) | grepl(gsub('-.*$','',today(tzone = "UTC")), earliest.date)) %>%
      filter(grepl('metal', band.genre,ignore.case = TRUE)) %>%
      mutate(
        bandalbum=paste0( band.link, album.type, album.date,
                          album %>% str_extract('^.?(?=-|\\/|\\()') %>% 
                            str_remove_all('\\W') %>% str_to_lower)
      ) %>% 
      distinct_at(vars(album.link),.keep_all = TRUE) %>% ## filter out the duplicates 
      distinct_at(vars(bandalbum),.keep_all = TRUE) %>%  
      arrange((album.link)) %>% 
      mutate(
        cover = paste0( 
          album.link,
          '|||',
          album.cover
        ),
        album = paste0(
          album,
          "|||",
          album.link,
          "|||",
          album.type
        ),
        band = paste0(
          band,
          "|||",
          band.link, 
          "|||",
          band.country
        ),
        asso = band.related,
        simi = band.similar,
        label = album.label,
        album.duration = case_when( (is.na (album.duration)) ~ '00:00:00',
                                    TRUE ~ album.duration),
        album.type =  paste0
        (album.duration,
          "|||",
          album.track
        ),
        earliestdate = case_when( (earliest.date<as.Date(album.date)) ~ 
                                    as.character(earliest.date), 
                                  TRUE ~ '0000-00-00'),   ## return '0000-00-00' if earliest.date >= album.date
        album.date = paste0(
          album.date,
          "|||",
          earliestdate
        ),
        blank=' ',
      ) %>% 
      select( cover, album, band, 
              band.genre, asso, simi,
              label, album.type, album.date
      ) %>% 
      mutate_if(is.character, ~ case_when(
        (is.na(.x)~''),
        TRUE~str_replace_all(.x,c('"\\>'="'",'\\\\?"'='\\\\"','^/'='','\\|/'="|"))
      ) ) %>%
      mutate(across(everything(),~ sprintf('"%s"',.x))) %>% 
      mutate(across(-c(length(.)),~ sprintf('%s,',.x))) %>% 
      mutate(
        seq = paste0('],['),
      ) %>% 
      
      t() %>%
      c(paste0('{"draw": 1, "lastUpdate":"',
               (lubridate::today(tzone = "UTC")),' UTC", "TTL":0.5,'),
        paste0('"recordsTotal":"',ncol(.),'",'),
        '"data": [[',.) %>% head(., -1) %>% append(']]}') %>% 
      write_lines(sep = "\n",
                  file='./html/new',append= FALSE)
  }
export.data(new.list)

################################# commit ##################################

save.image("../all.RData")

## clean the environment
unrm.list = c("new.list")
rm(list=setdiff(ls(), unrm.list))

################################# commit ##################################


"./CheckingOutShitonMA/" %T>% 
  git_commit_all("updating", repo = .) %>% 
  git_push(repo = .)
# git_log(max = 10,repo=repo)


######################    some statistics    #####################
# count.distinct = 
new.list %>% 
  distinct_at(vars(Title)) %>% 
  nrow()

# count.norerelease = 
new.list %>% 
  filter(
    Date <= earliest.date|is.na(earliest.date)
  ) %>% 
  nrow()


count.band = 
  new.list %>% 
  distinct_at(vars(band)) %>% 
  nrow()

count.black = 
  new.list %>% 
  filter(str_detect(Genre, "Black|black")) %>%
  nrow()

count.death = 
  new.list %>% 
  filter(str_detect(Genre, "Death|death")) %>%
  nrow()

count.fulllength = 
  new.list %>% 
  filter(str_detect(Type, "Full_length")) %>%
  nrow() 


data.frame(
  Genre = c("black", "death", "other(healthier)"),
  amount = c(
    releases %>% 
      filter(str_detect(Genre, "Black|black")) %>%
      nrow(),
    new.list %>% 
      filter(str_detect(Genre, "Death|death")) %>%
      nrow(),
    new.list %>% 
      filter(str_detect(Genre, "Black|black|Death|death", 
                        negate = TRUE)) %>%
      nrow()
  )
) %>% as.tibble() %>% 
  ggplot(., aes(x="", y=amount, fill=Genre))+
  geom_bar(width = 1, stat = "identity")+
  coord_polar("y", start=0)

new.list %>% 
  dplyr::group_by(Date) %>% 
  dplyr::summarise(n=n())





# 
