<template>
  <div>
    <v-row>
      <v-btn class="btn" color="primary">
        {{ sentence.normal }}
      </v-btn>
    </v-row>
    <v-row>
      <v-btn class="btn" v-for="(word, index) in words" :key="index">
        {{ word.normal }}
      </v-btn>
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
