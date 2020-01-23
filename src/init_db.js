const nlp = require('compromise')
const compromise_sentences = require('compromise-sentences')
nlp.extend(compromise_sentences)

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pond.db');

const sampleText = "I AM A CAT. As yet I have no name. I’ve no idea where I was born. All I remember is that I was miaowing in a dampish dark place when, for the first time, I saw a human being. This human being, I heard afterwards, was a member of the most ferocious human species; a shosei, one of those students who, in return for board and lodging, perform small chores about the house. I hear that, on occasion, this species catches, boils, and eats us. However as at that time I lacked all knowledge of such creatures, I did not feel particularly frightened. I simply felt myself floating in the air as I was lifted up lightly on his palm. When I accustomed myself to that position, I looked at his face. This must have been the very first time that ever I set eyes on a human being. The impression of oddity, which I then received, still remains today. First of all, the face that should be decorated with hair is as bald as a kettle. Since that day I have met many a cat but never have I come across such deformity. The center of the face protrudes excessively and sometimes, from the holes in that protuberance, smoke comes out in little puffs. I was originally somewhat troubled by such exhalations for they made me choke, but I learnt only recently that it was the smoke of burnt tobacco which humans like to breathe.";

db.serialize(() => {
  // Drop tables
  db.run('DROP TABLE IF EXISTS pond;');
  db.run('DROP TABLE IF EXISTS text;');
  db.run('DROP TABLE IF EXISTS sentence;');
  db.run('DROP TABLE IF EXISTS word;');
  db.run('DROP TABLE IF EXISTS word_statistics;');

  // Create tables
  db.run('CREATE TABLE IF NOT EXISTS pond (id integer primary key autoincrement, name text);');
  db.run('CREATE TABLE IF NOT EXISTS text (id integer primary key autoincrement, pond_id integer, original text);');
  db.run('CREATE TABLE IF NOT EXISTS sentence (id integer primary key autoincrement, pond_id integer, text_id integer, original text, normal text);');
  db.run('CREATE TABLE IF NOT EXISTS word (id integer primary key autoincrement, pond_id integer, text_id integer, sentence_id integer, original text, normal text);');
  db.run('CREATE TABLE IF NOT EXISTS word_statistics (pond_id integer, word text, appear_count integer default 0, correct_count integer default 0, incorrect_count integer default 0, PRIMARY KEY(pond_id, word));');

  // Create pond
  db.run("INSERT INTO pond (name) VALUES ('test_pond');");

  let sampleData = brokenDownText(sampleText);

  // Get last created pond id
  db.get('SELECT id FROM pond WHERE rowid = last_insert_rowid();', (err, row) => {
    let pondId = row.id;

    // Text registration
    db.serialize(() => {
      registerText(pondId, sampleData.original);

      // Get last registered text id
      db.get('SELECT id FROM text WHERE rowid = last_insert_rowid();', (err, row) => {
        let textId = row.id;

        // Sentences registration
        sampleData.sentences.forEach(sentence => {
          db.serialize(() => {
            registerSentence(pondId, textId, sentence);

            db.get('SELECT id FROM sentence WHERE rowid = last_insert_rowid();', (err, row) => {
              let sentenceId = row.id;

              // Words registration
              sentence.words.forEach(word => {
                console.log('Pond: ' + pondId + ', ' + 'Text: ' + textId + ', Sentence: ' + sentenceId + ', ' + word.normal);
                registerWord(pondId, textId, sentenceId, word);
                registerWordStatistics(pondId, word);
              });
            });
          });
        });
      });
    });
  });

});

//db.close();

function registerText(pondId, text) {
  db.run("INSERT INTO text (pond_id, original) VALUES ($pond_id, $original);", {
    $pond_id: pondId,
    $original: text,
  });
}

function registerSentence(pondId, textId, sentence) {
  db.run("INSERT INTO sentence (pond_id, text_id, original, normal) VALUES ($pond_id, $text_id, $original, $normal);", {
    $pond_id: pondId,
    $text_id: textId,
    $original: sentence.original,
    $normal: sentence.normal,
  });
}

function registerWord(pondId, textId, sentenceId, word) {
  db.run("INSERT INTO word (pond_id, text_id, sentence_id, original, normal) VALUES ($pond_id, $text_id, $sentence_id, $original, $normal);", {
    $pond_id: pondId,
    $text_id: textId,
    $sentence_id: sentenceId,
    $original: word.original,
    $normal: word.normal,
  });
}

function registerWordStatistics(pondId, word) {
  db.serialize(() => {
    db.run("INSERT INTO word_statistics (pond_id, word) SELECT $pond_id, $word WHERE NOT EXISTS (SELECT 1 FROM word_statistics WHERE pond_id = $pond_id AND word = $word);", {
      $pond_id: pondId,
      $word: word.normal,
    });
    db.run("UPDATE word_statistics SET appear_count = appear_count + 1 WHERE pond_id = $pond_id AND word = $word;", {
      $pond_id: pondId,
      $word: word.normal,
    });
  });
}

function brokenDownText(inputText) {
  let brokenDownText = {
    original: inputText,
    sentences: []
  }

  let sentences = nlp(inputText).sentences().json()

  brokenDownText.sentences = sentences.map(sentence => {

    let words = nlp(sentence.text).termList()

    return {
      original: sentence.text,
      normal: sentence.normal,

      words: words.map(word => {
        return {
          original: word.text,
          normal: word.reduced,
        }
      }),
    }
  })

  return brokenDownText
}
