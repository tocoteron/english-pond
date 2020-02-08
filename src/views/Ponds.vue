<template>
  <div class="ponds">
    <v-row>
      <v-col
        cols="12"
      >
        <v-form
          ref="form"
          v-model="validForm"
          lazy-validation
        >
          <v-text-field
            v-model="pondName"
            :counter="32"
            :rules="pondNameRules"
            label="Name"
            required
          ></v-text-field>

          <v-text-field
            v-model="pondDescription"
            :counter="128"
            :rules="pondDescriptionRules"
            label="Description"
            required
          ></v-text-field>

          <v-btn
            outlined
            color="primary"
            class="float-right mt-4"
            :disabled="!validForm"
            @click="createPond"
          >
            Create
          </v-btn>
        </v-form>
      </v-col>
    </v-row>

    <v-divider />

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

        <v-btn
          outlined
          :disabled="!$store.getters.hasSelectedPond"
          @click="selectPond(null)"
          color="primary"
          class="float-right mr-2"
        >
          Unselect pond
        </v-btn>
      </v-col>
    </v-row>

    <v-row
      v-for="pond in ponds"
      :key="pond.id"
    >
      <v-col
        cols="12"
      >
        <v-card
          outlined
          :color="isSelected(pond) ? 'primary' : ''"
        >
          <v-list-item three-line>
            <v-list-item-content>
              <v-list-item-title v-if="isSelected(pond)" class="mb-1 white--text font-weight-medium">
                {{ pond.name }} (Selected)
              </v-list-item-title>
              <v-list-item-title v-else class="mb-1 font-weight-medium">
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
const db = new sqlite3.Database('pond.db')

export default {
  name: "ponds",

  components: {
  },

  data: () => ({
    ponds: [],
    validForm: false,
    pondName: '',
    pondNameRules: [
      v => !!v || 'Pond name is required',
      v => (v && v.length <= 32) || 'Pond name must be less than 32 characters',
    ],
    pondDescription: '',
    pondDescriptionRules: [
      v => v.length <= 128 || 'Pond description must be less than 128 characters',
    ],
  }),

  computed: {
  },

  methods: {
    async createPond() {
      if (this.$refs.form.validate()) {
        // Add the pond to database
        await (() => {
          return new Promise((resolve, reject) => {
            db.run('INSERT INTO pond (name, description) VALUES ($name, $description)', {
              $name: this.pondName,
              $description: this.pondDescription,
            }, (err) => {
              if(err) {
                reject(err)
              }
              resolve()
            });
          })
        })()

        // Check the update
        this.loadPonds();
      }
    },

    async deletePond(pond) {
      // Delete the pond from database
      await (() => {
        return new Promise((resolve, reject) => {
          db.run('DELETE FROM pond WHERE id = $id', {
            $id: pond.id,
          }, (err) => {
            if(err) {
              reject(err)
            }
            resolve()
          });
        })
      })()

      // Check the update
      this.loadPonds();
    },

    loadPonds() {
      // Create tables
      db.run('CREATE TABLE IF NOT EXISTS pond (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT);');
      db.run('CREATE TABLE IF NOT EXISTS text (id INTEGER PRIMARY KEY AUTOINCREMENT, pond_id INTEGER, original TEXT);');
      db.run('CREATE TABLE IF NOT EXISTS sentence (id INTEGER PRIMARY KEY AUTOINCREMENT, pond_id INTEGER, text_id INTEGER, original TEXT, normal TEXT);');
      db.run('CREATE TABLE IF NOT EXISTS word (id INTEGER PRIMARY KEY AUTOINCREMENT, pond_id INTEGER, text_id INTEGER, sentence_id INTEGER, original TEXT, normal TEXT);');
      db.run('CREATE TABLE IF NOT EXISTS word_statistics (pond_id INTEGER, word TEXT, appear_count INTEGER DEFAULT 0, correct_count INTEGER DEFAULT 0, incorrect_count INTEGER DEFAULT 0, PRIMARY KEY(pond_id, word));');

      // Get all pond from database
      db.all('SELECT * FROM pond;', (err, rows) => {
        this.ponds = rows;
      });
    },

    selectPond(pond) {
      this.$store.commit('setPond', pond);
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
