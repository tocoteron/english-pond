<template>
  <div class="statistics">
    <v-row>
      <v-col>
        <v-btn
          outlined
          @click="loadWordStatistics"
          color="primary"
          class="float-right"
        >
          Reload word statistics
        </v-btn>
      </v-col>
    </v-row>

    <v-card>
      <v-card-title>
        Word statistics
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="word_statistics"
        :items-per-page="10"
        sort-by="appear_count"
        :sort-desc="true"
        :search="search"
      ></v-data-table>
    </v-card>
  </div>
</template>

<script>
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('pond.db')

export default {
  name: 'statistics',

  data: () => ({
    word_statistics: [],
    search: '',
    headers: [
      {
        text: 'Word',
        align: 'left',
        value: 'word',
      },
      {
        text: 'Appear count',
        value: 'appear_count',
      },
      {
        text: 'Correct count',
        value: 'correct_count',
      },
      {
        text: 'Incorrect count',
        value: 'incorrect_count',
      },
      {
        text: 'Evaluation value',
        value: 'evaluation'
      }
    ],
  }),

  methods: {
    loadWordStatistics() {
      db.all('SELECT * FROM word_statistics WHERE pond_id = $pond_id;', {
        $pond_id: this.$store.getters.selectedPond.id,
      }, (err, rows) => {
        this.word_statistics = rows;
        this.word_statistics.forEach(word => {
          word.evaluation = word.appear_count * ((word.incorrect_count + 1) / (word.incorrect_count + word.correct_count + 1))
        })
      });
    }
  },

  created() {
    if (!this.$store.getters.hasSelectedPond) {
      alert('Any ponds is not selected. Please select a pond.');
      this.$router.push('ponds');
    } else {
      this.loadWordStatistics();
    }
  }
}
</script>
