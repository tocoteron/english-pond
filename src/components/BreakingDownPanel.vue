<template>
  <div>
    <v-divider />

    <v-row>
      <v-col>
        <v-btn class="btn" color="primary">
          {{ sentence.normal }}
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-btn class="btn mr-1 mb-1" v-for="(word, index) in words" :key="index">
          {{ word.normal }}
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: 'breaking-down-panel',

  components: {
  },

  props: [
    'sentence',
    'words'
  ],

  data() {
    return {
    }
  },

  methods: {
  }
}
</script>

<style scoped>
.v-btn {
  text-transform: none;
}
</style>
