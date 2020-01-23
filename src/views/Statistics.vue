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

    <v-data-table
      :headers="headers"
      :items="word_statistics"
      :items-per-page="10"
      sort-by="appear_count"
      :sort-desc="true"
      class="elevation-1"
    ></v-data-table>
  </div>
</template>

<script>
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./src/pond.db')

export default {
  name: 'statistics',

  data: () => ({
    word_statistics: [],
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
    ],
  }),

  methods: {
    loadWordStatistics() {
      db.all('SELECT * FROM word_statistics WHERE pond_id = $pond_id;', {
        $pond_id: this.$store.getters.selectedPond.id,
      }, (err, rows) => {
        this.word_statistics = rows;
      });
    }
  },

  created() {
    if (!this.$store.getters.hasSelectedPond) {
      alert('Any ponds is not selected. Please select a pond.');
      this.$router.push('ponds');
    }

    this.loadWordStatistics();
  }
}
</script>
