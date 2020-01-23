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
        >
          <v-list-item three-line>
            <v-list-item-content>
              <v-list-item-title class="headline mb-1">
                {{ pond.name }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ pond.description }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-card-actions>
            <v-btn
              text
              color="primary"
              @click="selectPond(pond.id);"
            >
              Select
            </v-btn>
            <v-btn
              text
              color="error"
              @click="deletePond(pond.id);"
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
var db = new sqlite3.Database('./src/pond.db')

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
        console.log('loadPonds')
        console.log(rows);
        this.ponds = rows;
      });
    },
    selectPond(pondId) {
      console.log('selectPond: ' + pondId);
    },
    deletePond(pondId) {
      console.log('deletePond: ' + pondId);
    }
  },

  created() {
    console.log('ponds created');
    this.loadPonds();
  }
}
</script>
