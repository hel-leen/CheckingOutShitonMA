
library(tidyr)
library(dplyr)
library(purrr)
library(tibble)
library(readr)
library(stringr)
library(ggplot2)
library(rvest)
library(lubridate)
library(ggthemr)
library(magick)
library(crayon)
library(gert)
##########################  check out new shit  #################################

checkout =  
  function(){
    link = 
      "https://www.metal-archives.com/release/ajax-upcoming/json/1?sEcho=1&iColumns=5&sColumns=&iDisplayStart="
    
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
    band.links.i = NA
    band.name.i = NA
    release.info.i = NA
    
    for (i in 1:(trunc(count.records/100)+1)) {
      ajax.page = 
        link %>% 
        paste0(.,(i-1),"00") %>%
        read_file() %>% 
        minimal_html() %>% 
        html_elements("body")
      
      content =
        ajax.page %>% 
        html_elements("a") 
      
      content.http =
        content %>% 
        html_attr("href") %>%  
        str_extract('(http).*(?=\\\\)')
      
      album.link.i.p =
        content.http %>% 
        str_subset("albums")
      album.link.i = c(album.link.i, album.link.i.p) 
      
      album.title.i.p =
        content.http %>%
        str_subset("albums") %>%
        str_extract('(?<=\\"\\>).*(?=\\</a\\>)')
      album.title.i = c(album.title.i, album.title.i.p) 
      
      band.links.i.p =
        ajax.page %>% 
        html_children() %>% 
        as.character() %>% 
        str_extract_all("(?<=\\t)[^(\\t)|(\\n)]*") %>% 
        unlist() %>%  
        .[-c(1:6)] %>% 
        .[seq(4, length(.), 29)] %>% 
        str_remove_all("%5C%22") %>% 
        str_extract('(?<=\\")<.*>(?=\\")')
      band.links.i = c(band.links.i, band.links.i.p)
      
      band.name.i.p =
        content %>%
        str_extract(".*bands/.*") %>% 
        str_extract('(?<=\\"\\>).*(?=\\</a\\>)') %>% 
        str_c(";") %>%
        str_replace_na() %>%
        str_flatten() %>% 
        str_split("NA") %>%
        .[[1]] %>% 
        .[-length(.)] %>% 
        str_split(";",simplify = TRUE) %>%
        .[,-ncol(.)]
      
      band.name.i = plyr::rbind.fill.matrix(band.name.i, band.name.i.p)
      
      release.info.i.p =
        ajax.page %>% 
        html_text() %>% 
        str_remove_all('(th|st|nd|rd),|\\s(?=\\n)|\\n|\\t?|\\\\?|(\\"(?=\\"))')  %>% 
        str_extract('(?<=\\[\\[\\").*(?=\\"\\]\\])') %>% 
        str_split('(\\"\\],\\[\\")|(\\"\\],\\[\\")')  %>%
        .[[1]] %>% 
        str_split('\\",(\\")?',simplify = TRUE)
      release.info.i = rbind(release.info.i, release.info.i.p)
    }
    
    for (i in 1:ncol(band.name.i)) {
      band.name.i =  
        band.name.i %>% 
        as.data.frame() %>% 
        mutate(
          # .keep = "unused",
          "band.name.{i}" := .[,i]
        ) 
    }
    
    releases =
      Reduce(
        cbind,
        list(
          release.info.i %>% as.data.frame() %>% 
            transmute(
              Title = V2,
              Band = V1,
              Type = V3,
              Genre = V4,
              Date = parse_date_time(V5, c('%b %d, %y', '%b, %y', '%y'),
                                     select_formats='%y-%m-%d'),
            ),
          album.title.i %>% as.data.frame() %>% transmute(album.title =  (.)),
          album.link.i %>% as.data.frame() %>% transmute(album.link = (.)),
          band.links.i %>% as.data.frame() %>% transmute(band.links = (.))
        ) 
      ) %>% 
      drop_na(Title)
    
    list(
      return(releases)
    ) 
  }
## generate new data based on current date
name = Sys.Date() %>% format('%Y.%m.%d') %>% 
  paste0('releases.',.)
assign(name, checkout())

new = anti_join(
  by = c("Title", "Band", "Date"),
  y = new.list,
  x = name %>% 
    parse(text = .) %>% 
    eval())  

######################  check out extended shit  ######################

# extended version for every album

extended = function(df) {
  album.cover.i = NA
  album.label.i = NA
  album.duration.i = NA
  release.earliesttime.i = NA
  band.relate.i = NA
  band.country.i = NA
  class(release.earliesttime.i) = "Date"
  for (i in 1:length(df$album.link)) {
    album.page=
      df$album.link[i] %>%
      # clipr::read_clip() %>%
      read_html() %>% 
      html_elements('.band_name, #cover, #album_tabs>ul,
      dl.float_right, td[align="right"]>strong')  
    
    
    album.cover =
      album.page %>%
      .[str_which(.,'cover')] %>%
      html_nodes("img") %>%
      html_attr("src")
    if (length(album.cover) == 0) {
      album.cover = 'https://www.metal-archives.com/images/cat.jpg'
    }
    album.cover.i[i] = album.cover
    
    album.label =
      album.page %>%
      .[str_which(.,'float_right')] %>%  
      html_children() %>% 
      .[str_which(.,'Label')+1] %>%
      html_elements("a") %>%
      as.character()
    if(length(album.label) <= 0) { album.label = NA }
    album.label.i[i] = album.label
    
    album.duration=
      album.page %>%
      .[str_which(.,'strong')] %>%
      html_text2()
    if(length(album.duration) <= 0) { album.duration = NA }
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
      df$band.links[i] %>%
      # clipr::read_clip() %>%
      str_split(' / ') %>% 
      .[[1]] %>% 
      .[str_which(.,'metal-archives')] 
    
    band.country = NA
    for (j in 1:length(band.pages)) {
      band.country = 
        c(  c(band.country, " || "),
            band.pages[j] %>% 
              str_match('(?<=\\<a\\shref\\=\\")http.*(?=\\"\\>)') %>%
              read_html() %>% 
              html_elements("#band_stats>.float_left>dd:nth-of-type(1)>a") %>% 
              as.character()
        )
    }
    band.country = band.country[-c(1, 2)]  %>% str_flatten('|')
    band.country.i[i] = band.country
    
    band.relate = NA
    for (j in 1:length(band.pages)) {
      band.relate = 
        c(  c(band.relate, " || "),
            band.pages[j] %>% 
              str_match('(?<=\\<a\\shref\\=\\")http.*(?=\\"\\>)') %>%
              read_html() %>% 
              html_elements(".lineupBandsRow>td>a") %>% 
              as.character() %>% 
              sort() %>% 
              unique()
        )
    }
    band.relate = band.relate[-c(1, 2)]  %>% str_flatten('|')
    band.relate.i[i] = band.relate
    
  }
  
  df.extend =
    df %>% add_column(
      album.cover = album.cover.i,
      album.label = album.label.i,
      data.frame(V1 = album.duration.i %>%  ms(),
                 V2 = album.duration.i %>%  hms()
      ) %>%
        mutate(album.duration = coalesce(V1,V2),
               .keep="unused") %>%
        mutate(
          Duration = (album.duration + parse_date_time2('00:00:00','HMS',
                                                        tz = 'UTC',lt=TRUE)) %>%
            format('%H:%M:%S')
        ),
      earliest.date = release.earliesttime.i,
      band.country = band.country.i,
      band.relate = band.relate.i
    ) 
  
  return(
    df.extend
  )
}



if (nrow(new) > 0) {
  new.extended = extended(new)
  new.list = union(
    new.list,
    new.extended
  )
}


## generate a web page 
export.webpage = 
  function(dataname) { 
    target = './CheckingOutShitonMA/html/New.html'
    malink = 'https://www.metal-archives.com' #reduce page size
    dataname %>%
      filter(Date > Sys.Date() - days(180) & Date < Sys.Date() + days(180)) %>% 
      distinct_at(vars(album.link),.keep_all = TRUE) %>%  
      distinct_at(vars(album.cover),.keep_all = TRUE) %>%  
      distinct_at(vars(Title),.keep_all = TRUE) %>%  ## filter out the duplicates if any
      mutate( 
      ) %>%
      mutate(
        Cover = paste0( album.link %>% str_match('(?<=\\/)\\d[^.]*$'),
                        '|||',
                        album.cover %>% str_remove_all(malink)),
        Album = paste0('<a href="',album.link %>% 
                         str_remove_all(malink),'">',Title,'</a>'),
        Band = paste0(band.links %>% str_remove_all(malink), 
                      "|||",
                      band.country %>% 
                        str_remove_all('(<a href=\\"https://www.metal-archives.com/lists/\\w*\\">)|(</a>)')
        ),
        Info = band.relate %>% str_remove_all(malink),
        Label = album.label %>% str_remove_all(malink),
        Duration = case_when( (is.na (Duration)) ~ '00:00:00',
                              TRUE ~ Duration),
        Type =  paste0(Duration,
                       "|||",
                       Type),
        EarliestDate = case_when( (earliest.date<as.Date(Date)) ~ 
                                    as.character(earliest.date),   ## return NA if earliest.date >= Date
                                  TRUE ~ '0000-00-00'),
        Date = paste0(Date,
                      "|||",
                      EarliestDate)
      ) %>% 
      select( Cover, Album, Band, Genre, Info, 
              Label, Type, Date) %>% 
      # as.tibble() %>% 
      tableHTML::tableHTML(escape = FALSE,  
                           rownames=FALSE,  
                           class="newlist", 
                           second_headers = list(c(2, 3, 4), c(' ', 'Band Info.', 'Release Info.')),
                           footer = (lubridate::today(tzone = "GMT")) ## add datetime info
      ) %>% 
      htmltools::save_html(file=target) 
    
  }
export.webpage(new.list)

## clean the environment
unrm.list = c("new.list")
rm(list=setdiff(ls(), unrm.list))
save.image("~/.R/MA/all.RData")

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
