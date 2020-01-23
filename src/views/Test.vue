<template>
  <div class="test">
    <div v-if="word !== null" class="problem">
      <h1 class="text-center error--text">{{ word.word }}</h1>
      <v-progress-linear :value="time_percent" class="mb-5"></v-progress-linear>
      <h3 class="text-center my-5">Appear count: {{ word.appear_count }}, Correct count: {{ word.correct_count }}, Incorrect count: {{ word.incorrect_count }}</h3>
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
    timer: null,
    time_percent: null,
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
        ORDER BY appear_count * appear_count * ((incorrect_count + 1) / (incorrect_count + correct_count + 1)) DESC
        LIMIT 10
      )
      ORDER BY RANDOM();
      `,
      {
        $pond_id: this.$store.getters.selectedPond.id,
      },
      (err, row) => {
        if(row !== undefined) {
          this.word = row;

          this.time_percent = 100;

          let self = this;
          this.timer = setInterval(() => {
            if(self.time_percent <= 0) {
              self.incorrect();
            } else {
              self.time_percent--; 
            }
          }, 100);
        }
      });
    },

    correct() {
      if(this.timer !== null) {
        clearInterval(this.timer);
      }

      db.run('UPDATE word_statistics SET correct_count = correct_count + 1 WHERE pond_id = $pond_id AND word = $word;', {
        $pond_id: this.$store.getters.selectedPond.id,
        $word: this.word.word,
      });

      this.loadWord();
    },

    incorrect() {
      if(this.timer !== null) {
        clearInterval(this.timer);
      }

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

  beforeDestroy() {
    if(this.timer !== null) {
      clearInterval(this.timer);
    }
  }
}
</script>

<style scoped>
.test {
  display: flex;
  height: calc(100vh - 80px);
  align-items: center;
  justify-content: center;
}
</style>