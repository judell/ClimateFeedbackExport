
function stripWhitespace(text) {
  text = text.replace(/\s+/g, ' ');
  return text;
}

function escape(html) {
  return html.replace(/</g, '&lt;')
}

function reformat(anno) {
  var elt = document.createElement('div');
  elt.innerHTML = anno;
  elt.querySelector('.annotationTags').remove();

  var quoteHTML;
  var quote = elt.querySelector('.annotationQuote');
  if (quote) {
    quoteHTML = stripWhitespace(quote.innerHTML);
    quote.remove();
  }
  var quoteOutput = '';
  if (quoteHTML) {
    quoteOutput = escape(`<blockquote><em>${quoteHTML}</em></blockquote>`);
  }

  var comment = elt.querySelector('.annotationBody div');
  var commentHTML = stripWhitespace(comment.innerHTML);

  var user = anno.match(/\?user=(.+)"/)[1];

  var output = `
${quoteOutput}
[quote_sci user="${user}"]
${escape(commentHTML)}
`;

  return output;
}

function compareLocation(a,b) {
  var aStart = hlib.parseSelectors(a.target).TextPosition.start;
  var bStart = hlib.parseSelectors(b.target).TextPosition.start;
  if (aStart < bStart) {
    return 1;
  }
  if (aStart > bStart) {
    return -1;
  }
  return 0;
}

function compareDate(a,b) {
  if (a.updated < b.updated) {
    return -1;
  }
  if (a.updated > b.updated) {
    return 1;
  }
  return 0;
}

function formatAnnotationAndReplies(annotation, replies) {
  var _replies = hlib.findRepliesForId(annotation.id, replies);
  var all = [annotation].concat(_replies);
  var output = '';
  all.forEach ( anno => {
     var level = 0;
     if (anno.refs) {
       level = anno.refs.length;
     }
     output += reformat(hlib.showAnnotation(anno, 0));
    });
  output = `
&lt;section>
${output}
&lt;/section>

`;
  return output;
}

function singleNewlines(text) {
  text = text.replace(/[\n\r]+/g, '\n');
  return text;
}

function finalize(text) {
  text = singleNewlines(text);
  text = text.replace(/&lt;\/section>/g, '&lt;/section>\n');
  return text;
}

function processSearchResults(annos, replies) {
  annos = annos.map(a => hlib.parseAnnotation(a) );
  var sortKey = document.querySelector('input[name=sort]:checked').value;
  var sortFn = sortKey === 'location' ? compareLocation : compareDate;

  var annotations = annos.filter(x => ! x.isPagenote);
  
  // exclude annotations created programmatically with no TextPosition, 
  annotations = annotations.filter(x => hlib.parseSelectors(x.target).TextPosition);
  
  annotations.sort(sortFn).reverse();
  var annotationOutput = '';
  annotations.forEach(annotation => {
    annotationOutput += formatAnnotationAndReplies(annotation, replies);
  });
  hlib.getById('annotations').innerHTML = '<pre>' + finalize(annotationOutput) + '</pre>';

  var pagenotes = annos.filter(x => x.isPagenote);
  pagenotes.sort(compareDate);
  var pagenoteOutput = ''
  pagenotes.forEach(pagenote => {
    pagenoteOutput += formatAnnotationAndReplies(pagenote, replies);
  });
  hlib.getById('pagenotes').innerHTML = '<pre>' + finalize(pagenoteOutput) + '</pre>';
}

//var searchEvent = new Event('search');
//document.dispatchEvent(searchEvent);
document.addEventListener('search', function (e) {
  search();
}, false);

function search() {
  var url = hlib.getFromUrlParamOrLocalStorage('h_url');
  
  var params = { 
    url: url,
    group: '__world__',   // update when CF migrates to its own group
  }

  hlib.getById('annotations').innerHTML = '';
  hlib.getById('pagenotes').innerHTML = '';

  hlib.hApiSearch(params, processSearchResults);
}

function setUrl() {
  hlib.setLocalStorageFromForm('urlForm', 'h_url');
}

function getUrl() {
  return hlib.getFromUrlParamOrLocalStorage('h_url', '')
}

