const debug = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'none';
import 'regenerator-runtime/runtime';
import { Base64 } from 'js-base64';

const folderName = $('body').data('name');
const titleLength = $('body').data('length');
const titleLengthParsed = parseInt(titleLength);

//const json = require('../json/voltaire.json');
import dataJSON from '../json/takeout.json';
import dataDriveJSON from '../json/drive.json';

import finalJSON from '../json/final.json';

let noteLength;
let maxNoteLength;

export function initHome () {
  const Base = {
    init: function () {
      if (debug) console.log('Base-init !!');

      if (document.querySelector('.note') !== null) {
        //C'est la liste qui vient du Voltaire.json de GoogleTakeOut
        //Problème : les notes sont coupées (c'est pour cela qu'on doit télécharger le fichier depuis GDrive) (voir _dynnamicNoteHtml)
        this._dynnamicNote();
      }

      if (document.querySelector('.noteDrive') !== null) {
        this._dynnamicNoteDrive();
      }

      if (document.querySelector('.doc-content') !== null) {
        //A Faire en premier (télécharger le html du Drive et le transformer en json)
        this._dynnamicNoteHtml();
      }

      if (document.querySelector('.final') !== null) {
        this._final(folderName);
      }

      function removeEllipsis(str) {
        return str.replace(/\.\.\.$/gm, '');
      }

      if (document.querySelector('.readme') !== null) {
        let Finalarr = [];
        let Oppositearr = []; //juste pour debugger et voir quels items ne sont pas inclu dans l'include

        //S'affiche dans la console de index.html
        //C'est la fonction qui se charge de rassembler les 2 morceaux ensemble !
        for (let element of dataDriveJSON) {
          let memNote = element.note;
          let date = element.date;

          for (let element of dataJSON) {
            const excerptNew = Base64.decode(element.ebook_position.resolved_ranges.client_version_range.selected_text_info.selected_text);
            let cleanedExcerpt = removeEllipsis(excerptNew); //pour supprimer les ... mais uniquement en fin de phrase
            let cleanedExcerptSpace = cleanedExcerpt.replace(/ /g, " ");
            let result = memNote.includes(cleanedExcerptSpace);
            let opposite = !memNote.includes(cleanedExcerptSpace);

            //console.log('result : ' , cleanedExcerptSpace);
            //console.log(element.note_text, memNote);

            if (!opposite) {
              //Pour voir les items qui ne sont pas inclus dans les data finals
              //console.log('Oppositearr : ' , memNote);
            }

            if (result) {
              let tag;
              //TEMPORAIRE
              //let highlightStyle = element.highlight_style.substring(21, 28);

              //console.log(element.note_text , element.excerpt, '----', memNote);
              //problème avec le includes, c'est qu'il trouve bien un tag d'1 mot dans les notes exemple avec Bruxelles

              //TEMPORAIRE
/*              if (element.note_text.substring(9, 10) != '"') {
                tag = element.note_text.substring(9, 10);
              }*/

              Finalarr.push({
                note: memNote,
                date: date,
                //style: highlightStyle,
                //beforeNote: element.before_excerpt,
                //afterNote: element.after_excerpt,
                tag: tag
              });
              break;
            }
          }
        }

        if (Finalarr.length === 0) {
          console.log('Il faut dabord générer le json du Google Drive en allant sur le .html du drive et coper / coller le resultat de la console dans drive.json');
        } else {
          console.log('JSON a Copier coller dans final.json : ' , Finalarr);
        }
      }
    },

    _final: function (folderName) {
      if (debug) console.log('_final');
      let dynnamicNote = '';
      let looped = false;
      let once = true;

      async function importJSON(fileName) {
        try {
          const response = await fetch(`./assets/json/${folderName}/${fileName}.json`);
          const data = await response.json();
          return data;
        } catch (error) {
          console.error(error);
        }
      }

      if (titleLengthParsed) {
        maxNoteLength = titleLengthParsed;
      } else {
        maxNoteLength = 64;
      }

      importJSON('final').then(data => {
        if (data === undefined) {
          console.log('Attention, il faut placer le fichier final.json dans le bon repertoire du livre (sans oublier de placer le data attribute sur le body qui fait la liaison ici');
          return
        }
        data.forEach((item, index) => {
          noteLength = data.length;

          if (item.note.length < maxNoteLength && (item.style === '#FF7043' || item.style === '#FFDBDB' || item.style === '#ffb8a1')) {
            looped = true;
          }

          dynnamicNote +=
            `${item.note.length < maxNoteLength && (item.style === '#FF7043' || item.style === '#FFDBDB' || item.style === '#ffb8a1') && !once ? '</div>' : ''}
            <div style="background-color: ${item.style}80" id="${index}" ${item.tag != undefined ? `data-tag="${item.tag}"` : ''} class="${item.tag != undefined ? 'tag' : ''} item ${looped} ${item.style} ${item.note.length < maxNoteLength && (item.style === '#FF7043' || item.style === '#FFDBDB' || item.style === '#ffb8a1') ? 'title' : ''}">
            <p>
              ${item.tag !== undefined ? `<span class="before">${item.beforeNote}</span>` : ''}
              <span class="main">${item.note}</span>
              ${item.tag !== undefined ? `<span class="after">${item.afterNote}</span>` : ''}
            </p>
            <em>${item.date}</em>
            <em><a href="${item.pageUrl}">${item.page}</a></em>
            </div>
            
            ${item.note.length < maxNoteLength && (item.style === '#FF7043' || item.style === '#FFDBDB' || item.style === '#ffb8a1') ? '<div class="content-card">' : ''}
          `;

          if (index === 0) {
            once = false;
          }

          $('h1 span').text(noteLength);
        });

        $('.final').append(`${dynnamicNote}`);

/*        $('.final .item:not(.title)').on('click', function (e) {
          e.preventDefault();
          $(this).find('.before, .after').toggle( "slow", function() {});
        });*/

        $('.title').on('click', function (e) {
          e.preventDefault();
          $(this).next().toggleClass('active')
        });

        $('.content-card').each(function(index) {
          $('.tag').each(function(index) {
            //console.log($(this).text());
          });
        });

        $(".content-card").each(function(index) {
          const lengthItem = $(this).find('.item:not(.tag)').length;
          $(this).prev().append(`<i>${lengthItem}</i>`);
        });
      });
    },

    _dynnamicNote: function (e) {
      //Récupére le JSON du Takeout
      if (debug) console.log('_dynnamicNote');
      let dynnamicNote = '';
      dataJSON.forEach((item, index) => {

        const excerpt = item.ebook_position.resolved_ranges.client_version_range.selected_text_info.selected_text;

        dynnamicNote +=
        `<li>
          <p>${index} <strong>${item.note_text}</strong> ${Base64.decode(excerpt)}</p>
          </li>`;
    });

      $('.note').append(`${dynnamicNote}`);
    },

    _dynnamicNoteDrive: function (e) {
      if (debug) console.log('_dynnamicNoteDrive');

      let dynnamicNoteDrive = '';
      let note = dataDriveJSON.forEach((item, index) => {
          console.log(item.note);

      dynnamicNoteDrive +=
        `<li>
          <p>${index} ${item.note}</p>
          </li>`;
    });

      $('.noteDrive').append(`${dynnamicNoteDrive}`);
    },

    _dynnamicNoteHtml: function (e) {
      if (debug) console.log('_dynnamicNoteHtml');

      //On selectionne d'abord le bon endroit dans tout le Html
      if ($("h1:contains('Toutes vos annotations')")) {
        let test = $("h1:contains('Toutes vos annotations')");
        test.addClass('target');
      }
      if ($("h1:contains('All your annotations')")) {
        let test = $("h1:contains('All your annotations')");
        test.addClass('target');
      }

      let dynnamicNoteHtml = '';
      let constructArr = [];
      let style;

      const rgb2hex = (rgb) => `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`

      let textClass = $( ".target ~ table table td + td p:first-child" ).attr('class');
      let dateClass = $( ".target ~ table table td + td p:last-child span" ).attr('class');
      let pageClass = $( ".target ~ table table td:last-child p" ).attr('class');

      $( ".target ~ table table" ).each(function(index) {
        let text = $(this).find(`p.${textClass} span:not(.${dateClass})`).text();
        let date = $(this).find(`p.${textClass} span.${dateClass}`).text();
        let style = rgb2hex($(this).find(`p.${textClass} span`).css("background-color"));
        let page = $(this).find(`p.${pageClass} a`).text();
        let pageUrl = $(this).find(`p.${pageClass} a`).attr('href');

        constructArr.push({
          note: text,
          date,
          style,
          page,
          pageUrl,
          author: "Gueniffey"
        });
      });

      if (constructArr.length === 0)
      {
        console.log('Il faut changer les classes dans la fonction _dynnamicNoteHtml, et prendre celles qui correspondent aux notes de ce document');
      }  else {
        console.log('1. JSON a Copier/Coller dans xxxDrive.json : ' , constructArr);
      }
    }
  };

  Base.init();
}