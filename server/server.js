//dependency required
const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('hbs');
var app = express();
const port = process.env.PORT || 3000;
const request = require('request');
const showdown = require('showdown');
var cors = require('cors')

const converter = new showdown.Converter();

var fs = require('fs');
var pdf = require('html-pdf');

//setting view engine 
app.set('view engine', 'hbs')


// middleware
app.use(cors())
app.use(bodyParser.json());
app.use(express.static(__dirname + "/../public"))



//Routes


app.get('/', (req, res) => {
  res.render('index')
});


app.post('/generate', (req, res) => {
  var data = req.body
  //injecting request data to template string html
var webpage = `
<div id="contact-info" class="vcard">

    <!-- Microformats! -->

    <h1 class="fn">${data.firstname} ${data.lastname}</h1>

    <p>
${Object.keys(data.contact).map(function(key, index) { return `
<strong>${key}:</strong>
<span class="">${data.contact[key]}</span>
<br/>`; }).join('')}
</p>


</div>


<dl>

    <div class="row">
    <dt>Technical Skill</dt>
    <dd>
        <p>
${data.skills.details.map( function(key) {
return `<strong>${key.type}:</strong> ${key.items.map(function (key) {
    return `${key}`
}).join(', ')}`    
}
).join('<br/>')}
    </dd>

    <dd class="clear"></dd>
    <dt>Github Project</dt>
<dd>${data.github_projects.items.map(function (key) {
return `
<strong>${key['project_name']} ${ 
converter.makeHtml(key['tagline']).replace(/<(\/)?p([^>]*)>/g, '')
}</strong>
<br>${key['description'][0]} Technologies: ${key['technology_used'].tools.map(function (item){
return item}).join(', ') }
        <br>
`}).join('')}

    </dd>
</div>
    

<div class="row"></div>
    <dt>Other Project</dt>
    <dd>
        ${data.other_projects.items.map(function (key) {
return `<strong>${key['headline']}</strong>
<br>${key['points'][0]} Technologies: ${key['technology_used'].tools.map(function (item){
return item}).join(', ') }
        <br>
`}).join('')}
    </dd>
    <dd class="clear"></dd>

   <dt>Professional Experience</dt>
    <dd>
        <strong>${data.work_experience.items.map(function (key){
return `${key['title']}, ${key['organisation']}, ${key['location']}</strong>
<br>${key['details'][0]} Technologies: ${key['technology_used'].tools.map(function (item){ return item}).join(', ') }
<br>`

        })}
    </dd>

    </div>

<dt>Involvement</dt>
<dd>
<ul>
 ${data.involvement.organizations.map(function (key){ return `
<li style="text-decoration-style:disc"> ${key} </li>` })}
</ul>
</dd>

<dd class="clear"></dd>

<table>
    <tr>
        <th>Degree</th>
        <th>Major</th>
        <th>Institution</th>
        <th>graduation Year</th>
    </tr>
    <tr>
 ${data.education.schools.map(function (key){ return `
<td>${key['degree']}</td>
<td>${key['major']}</td>
<td>${key['institution']}</td>
<td>${key['graduation_year']}</td>

` })}
    </tr>

</table>
<dd class="clear"></dd>
<br/>
<br/>
<!-- 
<dt>Research Experience</dt>
    <dd>Available on request</dd>
    <dd class="clear"></dd>
</dl>

<div class="clear"></div> -->

</div>
`;


//setting options for PDF
  var options = { format: 'A4' };

  //Reads the Base Template from the Views Folder
  var template = hbs.compile(fs.readFileSync('././views/generate.hbs', 'utf8'));

  //Proccessing the base template with the content
  var html = template({content:webpage})

  var filename = `${data.firstname}${data.lastname}${new Date().toLocaleDateString()}`;
  //create PDF from the above generated html
  pdf.create(html, options).toFile(`./public/${filename}.pdf`, function (err, resp) {
   if(resp) return res.json({filename:filename+".pdf"})
    if (err) return console.log(err);
    console.log(res)
  });

});



//listen to voice of God
app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = {
  app
};