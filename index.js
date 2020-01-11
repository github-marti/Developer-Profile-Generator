const fs = require('fs');
const convertFactory = require('electron-html-to');
const axios = require('axios');
const inquirer = require('inquirer');

inquirer.prompt([{
    message: "Enter your GitHub username",
    name: "username"
  },
  {
    message: "Choose a color theme for your profile",
    type: "list",
    choices: ["wine red", "forest green", "sky blue", "mustard yellow", "almost black"],
    name: "colorChoice"
  }])

  .then(function({username, colorChoice}) {

    let bgColor,
        contentColor,
        cardColor;

    switch (colorChoice) {
      case "wine red":
        bgColor = "#6e0010";
        contentColor = "#ffccd3";
        cardColor = "#45000a";
        break;
      case "forest green":
        bgColor = "#215723";
        contentColor = "#dcfae1";
        cardColor = "#113813";
        break;
      case "sky blue":
        bgColor = "#ade2ff";
        contentColor = "white";
        cardColor = "#004469";
        break;
      case "mustard yellow":
        bgColor = "#e1ad01";
        contentColor = "white";
        cardColor = "#542900";
        break;
      case "almost black":
        bgColor = "#242424";
        contentColor = "#eeeeee";
        cardColor = "#444444";
        break;
      default:
        bgColor = "white";
        break;
    }

    // get URLs for github axios requests
    const queryUrl1 = `https://api.github.com/users/${username}`;
    const queryUrl2 = `https://api.github.com/users/${username}/repos?per_page=100`;

    //axios request
    axios.all([
      axios.get(queryUrl1),
      axios.get(queryUrl2)
    ])
    .then(axios.spread((response, response2) => {

      let starCount = 0;

      for (let i = 0; i < response2.data.length; i++) {
        starCount += response2.data[i]['watchers_count'];
      }

      const avatarURL = response.data.avatar_url;
      const fullName = response.data.name;
      const userBio = response.data.bio;
      const userCompany = response.data.company;
      const userLocation = response.data.location;
      const userBlog = response.data.blog;
      const publicRepos = response.data.public_repos;
      const followers = response.data.followers;
      const following = response.data.following;

      const HTML = 
      
      `<!DOCTYPE html>
      <head>
    
          <style>
          * {
              box-sizing: border-box;
          }
  
          body {
              background: ${bgColor};
              margin: 0;
              position: relative;
              font-family: Calibri, sans-serif;
          }
  
          .floating-header {
              position: absolute;
              z-index: 1;
              top: 150px;
              right: 40px;
              left: 40px;
              height: 250px;
              background: ${cardColor};
              color: white;
              text-align: center;
              padding-top: 90px;
              padding-bottom: 30px;
              border-radius: 5px;
          }
  
          .floating-header h1 {
              margin: 20px 0 10px;
          }
  
          .floating-header h3 {
              font-style: italic;
          }
  
          .floating-header a {
              color: white;
              padding: 0 20px;
              text-decoration: none;
          }
  
          .profile-image {
              position: absolute;
              z-index: 2;
              background-image: url("images/GitHub-Mark.png");
              background-position: center;
              background-size: cover;
              top: 50px;
              left: 50%;
              margin-left: -100px;
              width: 200px;
              height: 200px;
              border-radius: 50%;
              border: 4px solid white;
          }
  
          .middle-bg {
              position: absolute;
              background: ${contentColor};
              top: 300px;
              width: 100%;
              overflow: auto;
              padding-top: 100px;
              padding-bottom: 30px;
              text-align: center;
          }
  
          .middle-bg h2 {
              margin: 10px 30px;
          }

          #bio {
            margin-top: 40px;
            padding: 0;
          }
  
          .grid {
              justify-items: center;
              display: grid;
              grid-template-columns: 1fr 1fr;
              margin: 0 30px;
              padding: 20px;
          }
  
          .card {
              margin: 30px;
              padding: 30px 0;
              background: ${cardColor};
              color: white;
              overflow: auto;
              width: 80%;
              border-radius: 5px;
          }
  
      </style>
          
      </head>
      <body>
          <img class="profile-image" src="${avatarURL}">
          <div class="floating-header">
              <h1 id="user-name">${fullName}</h1>
              <h3>Currently at <span id="business">${userCompany}</span></h3>
              <a id="location" href="https://www.google.com/maps/place/${userLocation}">Location</a>
              <a id="github" href="https://github.com/${username}">GitHub</a>
              <a id="blog" href="${userBlog}">Blog</a>
          </div>
          <div class="middle-bg">
              <div>
                  <h2 id="bio">${userBio}</h2>
              </div>
              <div class="grid">
                  <div class="card">
                      <h2>Public Repositories</h2>
                      <h2 id="public-repos">${publicRepos}</h2>
                  </div>
                  <div class="card">
                      <h2>Followers</h2>
                      <h2 id="followers">${followers}</h2>
                  </div>
                  <div class="card">
                      <h2>GitHub Stars</h2>
                      <h2 id="stars">${starCount}</h2>
                  </div>
                  <div class="card">
                      <h2>Following</h2>
                      <h2 id="following">${following}</h2>
                  </div>
              </div>
          </div>
      </body>
      </html>`;
      
      const conversion = convertFactory({
        converterPath: convertFactory.converters.PDF,
        allowLocalFilesAccess: true,
      });

      conversion({ html: HTML, pdf: {  marginsType: 1,
        pageSize: 'A4',
        printBackground: true,
        landscape: false
      } }, function(err, result) {
        if (err) {
          return console.error(err);
        }
      
        result.stream.pipe(fs.createWriteStream('./pdf/developer-profile.pdf'));
        conversion.kill();
        });

      }))
    });

 
