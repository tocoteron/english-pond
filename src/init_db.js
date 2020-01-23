const nlp = require('compromise')
const compromise_sentences = require('compromise-sentences')
nlp.extend(compromise_sentences)

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pond.db');

const sampleText = "I AM A CAT. As yet I have no name. I’ve no idea where I was born. All I remember is that I was miaowing in a dampish dark place when, for the first time, I saw a human being. This human being, I heard afterwards, was a member of the most ferocious human species; a shosei, one of those students who, in return for board and lodging, perform small chores about the house. I hear that, on occasion, this species catches, boils, and eats us. However as at that time I lacked all knowledge of such creatures, I did not feel particularly frightened. I simply felt myself floating in the air as I was lifted up lightly on his palm. When I accustomed myself to that position, I looked at his face. This must have been the very first time that ever I set eyes on a human being. The impression of oddity, which I then received, still remains today. First of all, the face that should be decorated with hair is as bald as a kettle. Since that day I have met many a cat but never have I come across such deformity. The center of the face protrudes excessively and sometimes, from the holes in that protuberance, smoke comes out in little puffs. I was originally somewhat troubled by such exhalations for they made me choke, but I learnt only recently that it was the smoke of burnt tobacco which humans like to breathe. For a little while I sat comfortably in that creature’s palm, but things soon developed at a tremendous speed. I could not tell whether the shosei  was in movement or whether it was only I that moved; but anyway I began to grow quite giddy, to feel sick. And just as I was thinking that the giddiness would kill me, I heard a thud and saw a million stars. Thus far I can remember but, however hard I try, I cannot recollect anything thereafter. When I came to myself, the creature had gone. I had at one time had a basketful of brothers, but now not one could be seen. Even my precious mother had disappeared. Moreover I now found myself in a painfully bright place most unlike that nook where once I’d sheltered. It was in fact so bright that I could hardly keep my eyes open. Sure that there was something wrong, I began to crawl about. Which proved painful. I had been snatched away from softest straw only to be pitched with violence into a prickly clump of bamboo grass. After a struggle, I managed to scramble clear of the clump and emerged to find a wide pond stretching beyond it. I sat at the edge of the pond and wondered what to do. No helpful thought occurred. After a while it struck me that, if I cried, perhaps the shosei  might come back to fetch me. I tried some feeble mewing, but no one came. Soon a light wind blew across the pond and it began to grow dark. I felt extremely hungry. I wanted to cry, but I was too weak to do so. There was nothing to be done. However, having decided that I simply must find food, I turned, very, very slowly, left around the pond. It was extremely painful going. Nevertheless, I persevered and crawled on somehow until at long last I reached a place where my nose picked up some trace of human presence. I slipped into a property through a gap in a broken bamboo fence, thinking that something might turn up once I got inside. It was sheer chance; if the bamboo fence had not been broken just at that point, I might have starved to death at the roadside. I realize now how true the adage is that what is to be will be. To this very day that gap has served as my shortcut to the neighbor’s tortoiseshell.";

db.serialize(() => {
  // Drop tables
  db.run('DROP TABLE IF EXISTS pond;');
  db.run('DROP TABLE IF EXISTS text;');
  db.run('DROP TABLE IF EXISTS sentence;');
  db.run('DROP TABLE IF EXISTS word;');
  db.run('DROP TABLE IF EXISTS word_statistics;');

  // Create tables
  db.run('CREATE TABLE IF NOT EXISTS pond (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT);');
  db.run('CREATE TABLE IF NOT EXISTS text (id INTEGER PRIMARY KEY AUTOINCREMENT, pond_id INTEGER, original TEXT);');
  db.run('CREATE TABLE IF NOT EXISTS sentence (id INTEGER PRIMARY KEY AUTOINCREMENT, pond_id INTEGER, text_id INTEGER, original TEXT, normal TEXT);');
  db.run('CREATE TABLE IF NOT EXISTS word (id INTEGER PRIMARY KEY AUTOINCREMENT, pond_id INTEGER, text_id INTEGER, sentence_id INTEGER, original TEXT, normal TEXT);');
  db.run('CREATE TABLE IF NOT EXISTS word_statistics (pond_id INTEGER, word TEXT, appear_count INTEGER DEFAULT 0, correct_count INTEGER DEFAULT 0, incorrect_count INTEGER DEFAULT 0, PRIMARY KEY(pond_id, word));');

  // Create pond
  registerPond('empty_pond', 'This is a empty pond. There is no data.');
  registerPond('test_pond', 'This is a test pond. There is a sample text data.');

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

function registerPond(name, description) {
  db.run("INSERT INTO pond (name, description) VALUES ($name, $description);", {
    $name: name,
    $description: description,
  });
}

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
