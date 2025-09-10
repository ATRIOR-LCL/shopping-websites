<script lang="ts">
import { Vue } from 'vue-class-component';
import { View, RenderMethod, RenderMethodKind } from 'bwcx-client-vue3';

@View('/')
@RenderMethod(RenderMethodKind.SSR)
export default class HomeView extends Vue {
  mounted() {
    console.log('HomeView mounted');
  }
}
</script>

<template>
  <div>
    <h2>Home Page</h2>
  </div>
</template>
