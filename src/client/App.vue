<script lang="ts">
import { Vue, Options } from 'vue-class-component';
import Head from './components/head.vue';

@Options({
  components: {
    Head
  }
})
export default class App extends Vue {}
</script>

<template>
  <Head/>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>
