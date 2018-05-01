
tests({ 

  'search returns expected result': function() {
    let args = {
      element: getById('urlContainer'),
      name: 'URL',
      id: 'url',
      value: getUrl(),
      onChange: 'setUrl',
      type: '',
      msg: 'URL from which to export annotations',
    };
    createNamedInputForm(args);  
    getById('urlForm').value = 'https://www.example.com';
    var searchEvent = new Event('search');
    document.dispatchEvent(searchEvent);

    waitSeconds(2)
      .then( r => {
        let exportedAnnos = getById('annotations').innerText;
        let expectedSubstr = `<section>
<blockquote><em>used</em></blockquote>
[quote_sci user="dazza"]
 <p>what is "used" anyway?</p> 
</section>`;
        let result = (exportedAnnos.indexOf(expectedSubstr) != -1);
        assert ( result == true, `expected true, got ${result}`);
      })
      .catch (e => { 
        console.log(e.message);
        failHard();
      });
  },
});