<template>
  <v-app>
    <!-- For validating bottom navigation -->
    <v-app-bar class="d-none">
    </v-app-bar>

    <!-- Sizes your content based upon application components -->
    <v-content>

      <!-- Provides the application the proper gutter -->
      <v-container fluid>

        <!-- If using vue-router -->
        <router-view></router-view>
      </v-container>
    </v-content>

    <!--
    <v-footer app>
    </v-footer>
    -->

    <v-bottom-navigation
      app
      v-model="bottomNav"
      color="primary"
    >
      <v-btn
        v-for="item in items"
        :key="item.title"
        :to="item.link"
        :value="item.link"
      >
        <span>{{ item.title }}</span>
        <v-icon>{{ item.icon }}</v-icon>
      </v-btn>

      <h3 v-if="this.$store.getters.hasSelectedPond" id="selected-pond-name">
        {{ this.$store.getters.selectedPond.name }}
      </h3>
    </v-bottom-navigation>

  </v-app>
</template>

<script>
export default {
  name: 'App',

  components: {
  },

  data: () => ({
    items: [
      { title: 'Ponds', icon: 'mdi-wave', link: 'ponds' },
      { title: 'Register', icon: 'mdi-plus', link: 'register' },
      { title: 'Test', icon: 'mdi-check', link: 'test' },
      { title: 'Statistics', icon: 'mdi-poll', link: 'statistics' },
    ],
    bottomNav: 'ponds',
  }),
};
</script>

<style scoped>
.v-application {
  font-family: 'M PLUS 1p', sans-serif !important;
}

#nav-btn {
  bottom: 16px;
  right: 16px;
}

#selected-pond-name {
  line-height: 56px;
}
</style>
