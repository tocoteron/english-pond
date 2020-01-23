<template>
  <div class="ponds">
    <v-row>
      <v-col>
        <v-btn
          outlined
          @click="loadPonds"
          color="primary"
          class="float-right"
        >
          Reload Ponds
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        v-for="pond in ponds"
        :key="pond.id"
      >
        <v-card
          outlined
          :color="isSelected(pond) ? 'primary' : ''"
        >
          <v-list-item three-line>
            <v-list-item-content>
              <v-list-item-title v-if="isSelected(pond)" class="headline mb-1 white--text">
                {{ pond.name }} (Selected)
              </v-list-item-title>
              <v-list-item-title v-else class="headline mb-1">
                {{ pond.name }}
              </v-list-item-title>

              <v-list-item-subtitle :class="{ 'white--text' : isSelected(pond) }">
                {{ pond.description }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-card-actions>
            <v-btn
              text
              color="primary"
              @click="selectPond(pond);"
              :disabled="isSelected(pond)"
            >
              Select
            </v-btn>
            <v-btn
              text
              color="error"
              @click="deletePond(pond);"
              :disabled="isSelected(pond)"
            >
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./src/pond.db')

export default {
  name: "ponds",

  components: {
  },

  data: () => ({
    ponds: [],
  }),

  computed: {
  },

  methods: {
    loadPonds() {
      db.all('SELECT * FROM pond;', (err, rows) => {
        this.ponds = rows;
      });
    },

    selectPond(pond) {
      this.$store.commit('setPond', pond);
    },

    deletePond(pond) {
      console.log(pond)
    },

    isSelected(pond) {
      return this.$store.getters.hasSelectedPond && this.$store.getters.selectedPond.id === pond.id
    }
  },

  created() {
    this.loadPonds();
  }
}
</script>
