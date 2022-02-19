use wasm_bindgen::prelude::*; //import everything to create library

extern crate serde_json;
extern crate console_error_panic_hook;
extern crate regex;
extern crate rand;

use serde_json::Value as jsonValue;
use serde_json::Value::Null as jsonNull;
use regex::Regex;
use rand::prelude::*;

//use log::Level;
//use log::info;

#[wasm_bindgen(module = "src/app/app.component.ts")]
extern "C" {
    #[wasm_bindgen]
    fn read_file() -> JsValue;
}

#[wasm_bindgen]
pub fn render (test: usize, book: usize, ) -> String {  //need to be string for serde_json to index

    let mut result: String;
    let psalms: bool;
    if test == 0 && book == 18 { // use this to check input array values against Psalms for section rendering
        psalms = true; 
    } else {
        psalms = false;
    }

    let file = read_file();

    let contents = file.as_string().expect("Can't read json");
    let res = serde_json::from_str(&contents).unwrap();

    let p: jsonValue = res;

//because of type change from javascript to rust: first Array in Object has the items labelled "0" and "1" (numbers in strings) **CAN'T CHANGE JSON
    let bible_book = &p[format!("{}", &test)]["books"][&book];

    let title = bible_book["title"].as_str().unwrap();

    result = format!("<div class=\"headings\">{}</div>", title);

    let current = bible_book["chapters"].as_array().unwrap();
    let mut section: String;
    for chapter in current {
        section = format!("<section><div id =\"{}-{}-{}\"><div class=\"headings\" >", &test, &book, chapter["chapter"]);
        if psalms {
            let psal = format!("<p class=\"fontType\">PSALM {}</p></div>",chapter["chapter"]);
            section.push_str(&psal);
        } else {
            let chap = format!("<p class=\"fontType\">CHAPTER {}</p></div>",chapter["chapter"]);
            section.push_str(&chap);
        }
        for verse in chapter["verses"].as_array().unwrap() {
            if verse["ver"] == 1 {
                if psalms {
                    let desc = format!("<div class=\"psalm fontType\">{}</div>",verse["description"].as_str().unwrap()); //unwrap necessary to remove ""
                    section.push_str(&desc);
                };
                let first = format!("<a href = \"../book#{0}-{1}-{2}-1\" id = \"{0}-{1}-{2}-1\" ><p class=\"firstVerse fontType\">{3}</p></a>", &test, &book, chapter["chapter"], verse["scr"].as_str().unwrap());
                section.push_str(&first);
            } else {     
                if psalms {               
                    if verse["description"] != jsonNull {  // needed for psalm 119
                        let desc = format!("<p class=\"psalm fontType\">{}</p>",verse["description"].as_str().unwrap()); //unwrap necessary to remove ""
                        section.push_str(&desc);
                    }
                }
                let script = format!("<div id = \"{0}-{1}-{2}-{3}\" class = \"verses\"><a href = \"../book#{0}-{1}-{2}-{3}\" ><p class=\"verseNumber fontType\">{3}</p></a>
                                        <a href = \"../book#{0}-{1}-{2}-{3}\"><p class = \"scripture fontType\">{4}</p></a></div>", &test, &book, chapter["chapter"], verse["ver"], verse["scr"].as_str().unwrap());
                section.push_str(&script);
            }
        }
        if chapter != current.last().unwrap() {
            section.push_str("</div></section><hr>");
        } else {
            section.push_str("</div></section>");
        }
        result.push_str(&section);
    }
    if bible_book["note"] != jsonNull {
        let note =  format!("<br><div class = \"notes\">{}</div><hr>", bible_book["note"].as_str().unwrap());
        result.push_str(&note);
    } else {
        result.push_str("<hr>")
    }
    return result;
}

#[wasm_bindgen]
pub fn search (searches: usize, inp: String, acc: usize) -> String {
 console_error_panic_hook::set_once(); //debug info in browser
 
 let mut results_fin: String;

/*let w = &p;
console_log::init_with_level(Level::Debug);
let z =  format!("{:?}", w);
info!("{}", z); */
    match searches {
        0 => {
            results_fin = search_single(&inp, &acc, 0)
        }
        1 => {
           results_fin = search_single(&inp, &acc, 1)
        }
        _ => {
            let file = read_file();
            let mut results = format!("<br>");
        
            let re = Regex::new(r"[[:alpha:]]+").unwrap(); // only words to search for
            let inp_search = &inp.to_lowercase();
            let mut word_ind: Vec<&str> = re.find_iter(&inp_search).map(|m| m.as_str()).collect();
            let word_ind_out: Vec<&str> = re.find_iter(&inp).map(|m| m.as_str()).collect(); // input search terms minus any html for result statement
            let inp_str: String = word_ind_out.join(" ");
            word_ind.sort();
            word_ind.dedup(); // deduplicate after sorting removes duplicate words.
            if word_ind.is_empty() || (word_ind[0].chars().count() < 2 && word_ind[0].len() == word_ind.capacity()) { //return if search request invalid
                results_fin = format!("<div class = \"alert\">Search query must have a minimum of 2 characters</div>");
                return results_fin;
            } 
        
            let contents = file.as_string().expect("Can't read json");
            let res = serde_json::from_str(&contents).unwrap();
            let p: jsonValue = res;

            let mut i = 0;
            let mut search_num = 0;
            while i < 2 {
                let json_bible = p[format!("{}", i)]["books"].as_array().unwrap();
                for (j, books) in json_bible.iter().enumerate() {
                    for chapters in books["chapters"].as_array().unwrap() {
                        for verses in chapters["verses"].as_array().unwrap() {
                            let mut selected = String::from(verses["scr"].as_str().unwrap());
                            let mut counted = 0; 
                            let select = &selected.to_lowercase();
                            for word in word_ind.iter() { //check all words are in the scripture
                                let mat = format!("{}", &word.to_lowercase());
                                
                                if select.contains(&mat) { //find everything regardless of case
                                    if acc == 0 { //only count if accuracy is contains
                                        counted = counted +1;
                                    }else { // only count word if exact match
                                        let re = Regex::new(&format!("\\b{}\\b", &word.to_lowercase())).unwrap();
                                        if re.is_match(&select) {
                                            counted = counted +1;
                                        }
                                    }
                                } 
                            }
                            if counted == word_ind.len() { // find location of words
                                let mut highlight_insert = Vec::new();
                                for word in word_ind.iter() {
                                    if word == &"i" { // have to remove 'i' from highlight as it highlights the <i> tag; change to capital 'I'
                                        let re = Regex::new(&format!("\\b{}\\b", "I")).unwrap();
                                        if re.is_match(&selected) {
                                            let mat = re.find(&selected).unwrap(); //search in original case
                                            let match_offset = mat.start();
                                            let match_end = mat.end();
                                            highlight_insert.push([match_offset, match_end]);
                                        }
                                    } else {
                                    let re = Regex::new(&format!("\\b{}\\b", &word.to_lowercase())).unwrap();
                                        if re.is_match(&selected.to_lowercase()) {
                                            let select = &selected.to_lowercase();
                                            let mat = re.find(&select).unwrap();
                                            let match_offset = mat.start();
                                            let match_end = mat.end();
                                            highlight_insert.push([match_offset, match_end]);
                                        }
                                    }
                                }
                                highlight_insert.sort(); // sort so highest array index last
                                let mut copy_highlight = highlight_insert.clone();
                                for _match_word in highlight_insert { // add highlighting to the last match first
                                    let current = copy_highlight.last().unwrap();
                                    let match_offset = current[0];
                                    let match_end = current[1];
                                    selected.replace_range(match_end .. match_end, "</span>"); //end first
                                    selected.replace_range(match_offset..match_offset, "<span class=\"highlight\">");
                                    copy_highlight.pop();
                                }
                                let found = format!("<div id = \"{0}-{1}-{3}-{4}\" class = \"listResults\"> 
                                <p class=\"bookResults\">{2} {3}:{4}</p><p class = \"scrResults\">{5}</p></div>", 
                                i, j ,books["bookName"].as_str().unwrap(),chapters["chapter"], verses["ver"], selected); // extract route from id - see javascript, search component; angular stops routing from innerhtml
                                results.push_str(&found);
                                search_num += 1;
                            }
                        }
                    }
                }
                i =i + 1;
            }
                
            match search_num {
                0 => {
                    results_fin = format!("<div>There are no results for \"{}\".<br><br>Please check the spelling, or try part of a word with the 'Accuracy' set to 'Contains'.</div>", inp_str);
                },
                1 => {
                    results_fin = format!("<div>There is a Search Result For \"{}\":</div><br>", inp_str);
                    },
                _ => {            
                    results_fin = format!("<div>There are {} Search Results For \"{}\":</div><br>",search_num, inp_str);
                    },
            }
            results_fin = results_fin + &results;
        }
        
    }
    return results_fin;
}

fn search_single(inp: &str, acc: &usize, i: usize) -> String {
    let file = read_file();
    let mut results_fin: String;
    let mut results = format!("<br>");
    let mut search_num = 0;

    let re = Regex::new(r"[[:alpha:]]+").unwrap(); // only words to search for
    let inp_search = &inp.to_lowercase();
    let mut word_ind: Vec<&str> = re.find_iter(&inp_search).map(|m| m.as_str()).collect();
    let word_ind_out: Vec<&str> = re.find_iter(&inp).map(|m| m.as_str()).collect(); // input search terms minus any html for result statement
    let inp_str: String = word_ind_out.join(" ");
    word_ind.sort();
    word_ind.dedup(); // deduplicate after sorting removes duplicate words.
    if word_ind.is_empty() || (word_ind[0].chars().count() < 2 && word_ind[0].len() == word_ind.capacity()) { //return if search request invalid
        results_fin = format!("<div class = \"alert\">Search query must have a minimum of 2 characters</div>");
        return results_fin;
    } 

    let contents = file.as_string().expect("Can't read json");
    let res = serde_json::from_str(&contents).unwrap();
    let p: jsonValue = res;
    let json_bible = p[format!("{}", i)]["books"].as_array().unwrap();

    for (j, books) in json_bible.iter().enumerate() {
        for chapters in books["chapters"].as_array().unwrap() {
            for verses in chapters["verses"].as_array().unwrap() {
                let mut selected = String::from(verses["scr"].as_str().unwrap());
                let mut counted = 0; 
                let select = &selected.to_lowercase();
                for word in word_ind.iter() { //check all words are in the scripture
                    let mat = format!("{}", &word.to_lowercase());
                    if select.contains(&mat) { //find everything regardless of case
                        if *acc == 0 { //only count if accuracy is contains
                            counted = counted +1;
                        }else { // only count word if exact match
                            let re = Regex::new(&format!("\\b{}\\b", &word.to_lowercase())).unwrap();
                            if re.is_match(&select) {
                                counted = counted +1;
                            }
                        }
                    } 
                }
                if counted == word_ind.len() { // find location of words
                    let mut highlight_insert = Vec::new();
                    for word in word_ind.iter() {
                        if word == &"i" { // have to remove 'i' from highlight as it highlights the <i> tag; change to capital 'I'
                            let re = Regex::new(&format!("\\b{}\\b", "I")).unwrap();
                            if re.is_match(&selected) {
                                let mat = re.find(&selected).unwrap(); //search in original case
                                let match_offset = mat.start();
                                let match_end = mat.end();
                                highlight_insert.push([match_offset, match_end]);
                            }
                        } else {
                        let re = Regex::new(&format!("\\b{}\\b", &word.to_lowercase())).unwrap();
                            if re.is_match(&selected.to_lowercase()) {
                                let select = &selected.to_lowercase();
                                let mat = re.find(&select).unwrap();
                                let match_offset = mat.start();
                                let match_end = mat.end();
                                highlight_insert.push([match_offset, match_end]);
                            }
                        }
                    }
                    highlight_insert.sort(); // sort so highest array index last
                    let mut copy_highlight = highlight_insert.clone();
                    for _match_word in highlight_insert { // add highlighting to the last match first
                        let current = copy_highlight.last().unwrap();
                        let match_offset = current[0];
                        let match_end = current[1];
                        selected.replace_range(match_end .. match_end, "</span>"); //end first
                        selected.replace_range(match_offset..match_offset, "<span class=\"highlight\">");
                        copy_highlight.pop();
                    }
                    let found = format!("<div id = \"{0}-{1}-{3}-{4}\" class = \"listResults\"> 
                    <p class=\"bookResults\">{2} {3}:{4}</p><p class = \"scrResults\">{5}</p></div>", 
                    i, j ,books["bookName"].as_str().unwrap(),chapters["chapter"], verses["ver"], selected); // extract route from id - see javascript, search component; angular stops routing from innerhtml
                    results.push_str(&found);
                    search_num += 1;
                }
            }
        }
    }
        
    match search_num {
        0 => {
            results_fin = format!("<div>There are no results for \"{}\".<br><br>Please check the spelling, or try part of a word with the 'Accuracy' set to 'Contains'.</div>", inp_str);
            },
        1 => {
            results_fin = format!("<div>There is a Search Result For \"{}\":</div><br>", inp_str);
            },
        _ => {            
            results_fin = format!("<div>There are {} Search Results For \"{}\":</div><br>",search_num, inp_str);
            },
    }
    results_fin = results_fin + &results;
    return results_fin;

}
#[wasm_bindgen]
pub fn render_widget() -> String {  //need to be string for serde_json to index

    console_error_panic_hook::set_once(); //debug info in browser

    // random generate book
    let mut test_rng = thread_rng();
    let test: usize = test_rng.gen_range(0..2); // excludes higher number
    let book: usize;
    if test == 0 {
        let mut book_rng = thread_rng();
        book = book_rng.gen_range(0..39);
    } else {
        let mut book_rng = thread_rng();
        book = book_rng.gen_range(0..27);
    }

    let mut result: String;
    let psalms: bool;
    if test == 0 && book == 18 { // use this to check input array values against Psalms for section rendering
        psalms = true; 
    } else {
        psalms = false;
    }

    let file = read_file();

    let contents = file.as_string().expect("Can't read json");
    let res = serde_json::from_str(&contents).unwrap();

    let p: jsonValue = res;

//because of type change from javascript to rust: first Array in Object has the items labelled "0" and "1" (numbers in strings) **CAN'T CHANGE JSON
    let bible_book = &p[format!("{}", &test)]["books"][&book];

    let current = bible_book["chapters"].as_array().unwrap();
    let num_chapters = current.len();
    let mut chap_rng = thread_rng();
    let chap = chap_rng.gen_range(0..num_chapters);

    result = format!("<section class = \"head\" id =\"{}-{}-{}\">", test, book, chap);

/*
let w = &chap;
console_log::init_with_level(Level::Debug);
let z =  format!("{:?}", w);
info!("{}", z); 
*/
    let chapter = &current[chap];
    for verse in chapter["verses"].as_array().unwrap() {
        if verse["ver"] == 1 {
            if psalms {
                let desc = format!("<p class=\"psalm fontType\">{}</p>", verse["description"].as_str().unwrap()); //unwrap necessary to remove ""
                result.push_str(&desc);
            };
            let first = format!("<div id = \"1\"><p class=\" ver firstVerse fontType\">{}</p></div>", verse["scr"].as_str().unwrap());
            result.push_str(&first);
        } else {     
            if psalms {               // needed for psalm 119
                if verse["description"] != jsonNull {
                    let desc = format!("<p class=\"psalm fontType\">{}</p>",verse["description"].as_str().unwrap()); //unwrap necessary to remove ""
                    result.push_str(&desc);
                }
            }
            let script = format!("<div id = \"{0}\"  class = \"ver verses\"><p class=\"verseNumber fontType\">{0}</p>
                                    <p class = \"scripture fontType\">{1}</p></div>", verse["ver"], verse["scr"].as_str().unwrap());
            result.push_str(&script);
        }
    }

    if bible_book["note"] != jsonNull && chapter == current.last().unwrap(){
        let note =  format!("<br><div class = \"notes\">{}</div></section>", bible_book["note"].as_str().unwrap());
        result.push_str(&note);
    } else {
        result.push_str("</section>")
    }

    return result;
}