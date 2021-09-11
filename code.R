### Created By: hel_leen
### Year: 2021
### Open source under the MIT License.

library(tidyr)
library(dplyr)
library(purrr)
library(tibble)
library(readr)
library(stringr)
library(ggplot2)
library(rvest)
library(lubridate)
library(gert)
##########################  check out new shit  #################################
checkout =  
  function(link){
    malink = 
      "https://www.metal-archives.com"
    
    ajax.page = 
      link %>% 
      paste0(.,"000") %>%  
      read_file() %>% 
      minimal_html() %>% 
      html_elements("body")
    
    count.records =
      ajax.page %>% 
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
      ajax.page = 
        link %>% 
        paste0(.,(i-1),"00") %>%
        read_file() %>% 
        minimal_html() %>% 
        html_elements("body")
      
      
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
          # band.name.i %>% select(contains("band.name")),
        ) 
      ) %>% drop_na(album)
    
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
      return(releases)
    ) 
  }
malink = 
  "https://www.metal-archives.com"
upcoming =
  "https://www.metal-archives.com/release/ajax-upcoming/json/1?sEcho=1&iDisplayStart="


## generate new data based on current date
name = Sys.Date() %>% format('%Y.%m.%d') %>% 
  paste0('releases.',.)
assign(name, checkout(upcoming))

new = anti_join(
  by = c("album.id"),
  y = new.list,
  x = name %>% 
    parse(text = .) %>% 
    eval())  


# extend every album
extended = function(df=new) {
  album.cover.i = NA
  album.label.i = NA
  album.track.i = NA
  album.duration.i = NA
  release.earliesttime.i = NA
  band.related.i = NA
  band.country.i = NA
  class(release.earliesttime.i) = "Date"
  i = 1
  # df=new
  while (i <= length(df$album.link)) {
    malink = 
      "https://www.metal-archives.com"
    album.page=
      df$album.link[i] %>%
      paste0(malink,'/release/view/id/',.) %>% 
      # clipr::read_clip() %>%
      read_html() %>% 
      html_elements('.band_name, #cover, #album_tabs>ul,
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
    
    # if (length(album.cover) != 0) {   album.cover %>%   image_read("./path/image.jpeg") }
    
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
        read_html() %>%
        html_elements("td>a") %>%
        html_text() %>%
        parse_date_time(c('%b %d, %y', '%b, %y', '%y'),
                        select_formats='%y-%m-%d') %>%
        min()
    }
    release.earliesttime.i[i] = release.earliestdate
    
    
    band.pages =
      df$band.link[i] %>%
      str_split('\\s(\\||\\/)\\s') %>% 
      # clipr::read_clip() %>%
      .[[1]] %>% 
      .[str_which(.,'\\d+')] 
    
    
    band.country = NA
    for (j in 1:length(band.pages)) {
      band.country = 
        c(  c(band.country, " || "),
            band.pages[j] %>% 
              paste0(malink,'/bands/view/',.) %>% 
              read_html() %>%  
              html_elements("#band_stats>.float_left>dd:nth-of-type(1)>a") %>% 
              as.character()%>% 
              str_extract('(?<=\\"\\>).*(?=\\</a\\>)')
        )
    }
    band.country = band.country[-c(1, 2)]  %>% str_flatten('|')
    band.country.i[i] = band.country
    
    band.related = NA
    for (j in 1:length(band.pages)) {
      band.related = 
        c(  c(band.related, " || "),
            band.pages[j] %>% 
              paste0(malink,'/bands/view/',.) %>% 
              read_html() %>%  
              html_elements(".lineupbandsRow>td>a") %>% 
              as.character() %>% 
              str_extract('\\/\\d+?(?=\\"\\>).*(?=\\</a\\>)') %>% 
              sort() %>% 
              unique()
        )
    }
    band.related = band.related[-c(1, 2)]  %>% str_flatten('|')
    band.related.i[i] = band.related
    
    
    i = i+1
  }
  # new.extended =
  df.extended =
    df %>% add_column(
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
      earliest.date = release.earliesttime.i,
      band.country = band.country.i,
      band.related = band.related.i
    ) 
  
  
  return(
    df.extended
  )
}

new.list =
  union(
    new.list,
    new.extended
  ) %>% 
  mutate(
    index = row_number()
  )   %>%   
  arrange(desc(index)) %>%  
  distinct_at(vars(album.link),
              .keep_all = TRUE) %>% 
  ### if duplicated entries exist, keep newer ones (in case of updated info)
  arrange((index)) %>% 
  select(!index)



### generate a web page ### now deprecated
#
# export.webpage = 
#   function(dataname) { 
#     target = './CheckingOutShitonMA/html/New.html'
#     dataname %>%
#       filter(Date > Sys.Date() - days(183) & Date < Sys.Date() + days(183)) %>% 
#       # distinct_at(vars(album.cover),.keep_all = TRUE) %>%  
#       distinct_at(vars(album.link),.keep_all = TRUE) %>%  
#       distinct_at(vars(Title),.keep_all = TRUE) %>%  ## filter out the duplicates if any
#       mutate(
#         Cover = paste0( 
#           album.link %>% str_match('(?<=\\/)\\d[^.]*$'),
#           '|||',
#           album.cover
#         ),
#         Album = paste0(
#           Title,
#           "|||",
#           album.link
#         ),
#         Band = paste0(
#           Band,
#           "|||",
#           band.links, 
#           "|||",
#           band.country
#         ),
#         Asso = band.related,
#         Label = album.label,
#         Duration = case_when( (is.na (Duration)) ~ '00:00:00',
#                               TRUE ~ Duration),
#         Type =  paste0
#         (Duration,
#           "|||",
#           Type
#         ),
#         EarliestDate = case_when( (earliest.date<as.Date(Date)) ~ 
#                                     as.character(earliest.date),  
#                                   TRUE ~ '0000-00-00'),   ## return '0000-00-00' if earliest.date >= Date
#         Date = paste0(
#           Date,
#           "|||",
#           EarliestDate
#         )
#       ) %>% 
#       select( Cover, Album, Band, 
#               Genre, Asso, Label, 
#               Type, Date) %>% 
#       tableHTML::tableHTML(escape = FALSE,  
#                            rownames=FALSE,  
#                            class="newlist", 
#                            second_headers = list(c(2, 3, 4), c(' ', 'Band Info.', 'Release Info.')),
#                            footer = (lubridate::today(tzone = "GMT")) ## add datetime info
#       ) %>% 
#       htmltools::save_html(file=target) 
#     
#   }
# export.webpage(new.list)


### generate a JSON file
export.data = 
  function(dataname) { 
    dataname %>%
      arrange(desc(album.link)) %>% 
      filter(album.date > Sys.Date() - days(183) & album.date < Sys.Date() + days(183)) %>% 
      filter(is.na(earliest.date) | grepl('202', earliest.date)) %>% 
      distinct_at(vars(album),.keep_all = TRUE) %>%
      distinct_at(vars(album.link),.keep_all = TRUE) %>% ## filter out the duplicates if any
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
          album.link
        ),
        band = paste0(
          band,
          "|||",
          band.link, 
          "|||",
          band.country
        ),
        asso = band.related,
        label = album.label,
        album.duration = case_when( (is.na (album.duration)) ~ '00:00:00',
                                    TRUE ~ album.duration),
        album.type =  paste0
        (album.duration,
          "|||",
          album.track,
          "|||",
          album.type
        ),
        earliestdate = case_when( (earliest.date<as.Date(album.date)) ~ 
                                    as.character(earliest.date), 
                                  TRUE ~ '0000-00-00'),   ## return '0000-00-00' if earliest.date >= album.date
        album.date = paste0(
          album.date,
          "|||",
          earliestdate
        )
      ) %>% 
      # mutate(across( ,~ URLencode(.x))) %>% 
      select( cover, album, band, 
              band.genre, asso, label, 
              album.type, album.date) %>% 
      mutate_if(is.character, ~ str_replace_all(.x,'\\"',"'")) %>%
      mutate_if(is.character, ~ str_replace_all(.x,"\\\\\'","'")) %>%
      mutate(across(,~ sprintf('"%s"',.x))) %>% 
      mutate(across(-c(length(.)),~ sprintf('%s,',.x))) %>% 
      mutate(
        seq = paste0('],['),
      ) %>% 
      t() %>%
      c(paste0('{"draw": 1, "lastUpdate":"',
               (lubridate::today(tzone = "GMT")),' UTC",'),
        paste0('"recordsTotal":"',ncol(.),'",'),
        '"data": [[',.,']]}') %>% 
      write_lines(sep = "\n",
                  file='./CheckingOutShitonMA/html/release',append= FALSE)
  }
export.data(new.list)


## clean the environment
unrm.list = c("new.list")
rm(list=setdiff(ls(), unrm.list))
save.image("~/.R/MA/new.RData")

################################# commit ##################################


repo = "./CheckingOutShitonMA/"
git_commit_all("updating", repo = repo)
git_push(repo=repo)
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
