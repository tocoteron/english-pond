<template>
  <div class="test">
    <div v-if="word !== null" class="problem">
      <v-row class="py-6">
        <v-col cols="12">
          <h1 class="text-center error--text">{{ word.word }}</h1>
          <v-progress-linear :value="100 * word.evaluation / word.appear_count" class="mb-5"></v-progress-linear>
          <h3 class="text-center my-2">Appear count: {{ word.appear_count }}, Correct count: {{ word.correct_count }}, Incorrect count: {{ word.incorrect_count }}</h3>
          <h3 class="text-center mt-2 mb-4">Evaluation: {{ word.evaluation }}</h3>
          <div class="text-center">
            <v-btn
              outlined
              color="success"
              class="mr-2"
              @click="correct"
            >
              I know.
            </v-btn>
            <v-btn
              outlined
              color="error"
              @click="incorrect"
            >
              I don't know.
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <v-divider class="my-4" />
      <h2 class="text-center py-2">Sentences</h2>

      <v-list>
        <template v-for="(sentence, index) in sentences">
          <v-list-item :key="sentence.normal">
            <v-list-item-content>
              <v-list-item-subtitle>{{ sentence.original }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-divider :key="index" />
        </template>
      </v-list>
    </div>
    <div v-else>
      <h1>None word.</h1>
    </div>

  </div>
</template>

<script>
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./src/pond.db')

export default {
  name: 'test',

  data: () => ({
    word: null, 
    sentences: [],
  }),

  methods: {
    loadWord() {
      db.get(
      `
      SELECT *
      FROM (
        SELECT *
        FROM word_statistics
        WHERE pond_id = $pond_id
        ORDER BY appear_count * ((incorrect_count + 1) / (incorrect_count + correct_count + 1)) DESC
        LIMIT 10
      )
      ORDER BY RANDOM();
      `,
      {
        $pond_id: this.$store.getters.selectedPond.id,
      },
      (err, row) => {
        if(row !== undefined) {
          row.evaluation = row.appear_count * ((row.incorrect_count + 1) / (row.incorrect_count + row.correct_count + 1))
          this.word = row;

          this.loadSentences()
        }
      });
    },

    loadSentences() {
      console.log(this.$store.getters.selectedPond.id)
      console.log(this.word)
      db.all('SELECT * FROM word, sentence WHERE word.pond_id = $pond_id AND word.normal = $word AND word.sentence_id = sentence.id GROUP BY sentence.id;', {
        $pond_id: this.$store.getters.selectedPond.id,
        $word: this.word.word,
      },
      (err, rows) => {
        console.log(rows)
        this.sentences = rows;
      });
    },

    correct() {
      db.run('UPDATE word_statistics SET correct_count = correct_count + 1 WHERE pond_id = $pond_id AND word = $word;', {
        $pond_id: this.$store.getters.selectedPond.id,
        $word: this.word.word,
      });

      this.loadWord();
    },

    incorrect() {
      db.run('UPDATE word_statistics SET incorrect_count = incorrect_count + 1 WHERE pond_id = $pond_id AND word = $word;', {
        $pond_id: this.$store.getters.selectedPond.id,
        $word: this.word.word,
      });

      this.loadWord();
    }
  },

  created() {
    if (!this.$store.getters.hasSelectedPond) {
      alert('Any ponds is not selected. Please select a pond.');
      this.$router.push('ponds');
    } else {
      this.loadWord();
    }
  },
}
</script>
