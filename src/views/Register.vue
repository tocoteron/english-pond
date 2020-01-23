<template>
  <div class="register">
    <v-row>
      <v-col>
        <v-btn
          outlined
          color="primary"
          class="mb-1 float-right"
          @click="registerWords"
        >
          Register words
        </v-btn>
      </v-col>
    </v-row>

    <v-textarea
      v-model="inputText"
      label="Input text"
    ></v-textarea>

    <BreakingDownPanel
      v-for="(sentence, index) in brokenDownText.sentences"
      :key="index"
      :sentence="sentence"
      :words="sentence.words"
    ></BreakingDownPanel>

  </div>
</template>

<script>
import BreakingDownPanel from '@/components/BreakingDownPanel.vue'
import nlp from 'compromise'
import compromise_sentences from 'compromise-sentences'
nlp.extend(compromise_sentences)

import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./src/pond.db')

export default {
  name: "register",

  components: {
    BreakingDownPanel,
  },

  data: () => ({
    inputText: '',
  }),

  computed: {
    brokenDownText() {
      let brokenDownText = {
        original: this.inputText,
        sentences: []
      }

      let sentences = nlp(this.inputText).sentences().json()

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
    },
  },

  methods: {
    registerWords() {
      let pondId = this.$store.getters.selectedPond.id;
      let targetData = this.brokenDownText;

      // Text registration
      db.serialize(() => {
        this.registerText(pondId, targetData.original);

        // Get last registered text id
        db.get('SELECT id FROM text WHERE rowid = last_insert_rowid();', (err, row) => {
          let textId = row.id;

          // Sentences registration
          targetData.sentences.forEach(sentence => {
            db.serialize(() => {
              this.registerSentence(pondId, textId, sentence);

              db.get('SELECT id FROM sentence WHERE rowid = last_insert_rowid();', (err, row) => {
                let sentenceId = row.id;

                // Words registration
                sentence.words.forEach(word => {
                  this.registerWord(pondId, textId, sentenceId, word);
                  this.registerWordStatistics(pondId, word);
                });
              });
            });
          });
        });
      });

      this.inputText = '';
    },

    registerText(pondId, text) {
      db.run("INSERT INTO text (pond_id, original) VALUES ($pond_id, $original);", {
        $pond_id: pondId,
        $original: text,
      });
    },

    registerSentence(pondId, textId, sentence) {
      db.run("INSERT INTO sentence (pond_id, text_id, original, normal) VALUES ($pond_id, $text_id, $original, $normal);", {
        $pond_id: pondId,
        $text_id: textId,
        $original: sentence.original,
        $normal: sentence.normal,
      });
    },

    registerWord(pondId, textId, sentenceId, word) {
      db.run("INSERT INTO word (pond_id, text_id, sentence_id, original, normal) VALUES ($pond_id, $text_id, $sentence_id, $original, $normal);", {
        $pond_id: pondId,
        $text_id: textId,
        $sentence_id: sentenceId,
        $original: word.original,
        $normal: word.normal,
      });
    },

    registerWordStatistics(pondId, word) {
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

  },

  created() {
    if (!this.$store.getters.hasSelectedPond) {
      alert('Any ponds is not selected. Please select a pond.');
      this.$router.push('ponds');
    }
  }
}
</script>

