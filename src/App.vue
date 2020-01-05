<template>
  <v-app>
    <v-btn
      id="nav-btn"
      class="d-lg-none"
      fixed
      fab
      dark
      color="purple darken-4"
      @click.stop="drawer = !drawer"
    >
      <v-app-bar-nav-icon></v-app-bar-nav-icon>
    </v-btn>

    <v-navigation-drawer
      app
      v-model="drawer"
    >
      <v-list
        dense
        nav
      >
        <v-list-item
          v-for="item in items"
          :key="item.title"
          :to="item.link"
          link
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!--
    <v-app-bar app>
    </v-app-bar>
    -->

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
  </v-app>
</template>

<script>
//import HelloWorld from './components/HelloWorld';

export default {
  name: 'App',

  components: {
    //HelloWorld,
  },

  data: () => ({
    items: [
      { title: 'Ponds', icon: 'mdi-wave', link: 'home' },
      { title: 'Register', icon: 'mdi-plus', link: 'register' },
      { title: 'Test', icon: 'mdi-check', link: 'home' },
      { title: 'Statistics', icon: 'mdi-poll', link: 'home' },
    ],
    drawer: null,
  }),
};
</script>

<style scoped>
#nav-btn {
  bottom: 16px;
  right: 16px;
}
</style>
