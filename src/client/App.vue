<script lang="ts">
import { Vue, Options } from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import Head from './components/head.vue';
import { ApiClient } from '@common/api/api-client';

@Options({
  components: {
    Head,
  },
  inject: ['apiClient'],
})
export default class App23110501092 extends Vue {
  declare apiClient: ApiClient;
  appState = {
    isLoggedIn: false,
    username: 'Guest',
  };

  async checkSession() {
    const res = await this.apiClient.getSession();
    console.log("res.data", res.data);

    if ( res.data) {
      this.appState.isLoggedIn = true;
      this.appState.username = (res.data as any).username || 'Guest';
      console.log('User is logged in as:', this.appState.username );
    } else {
      this.appState.isLoggedIn = false;
      this.appState.username = 'Guest';
    }
    console.log('Session check response:', res);
  }

  @Watch('$route')
  async onRouteChange(newRoute: any, oldRoute: any) {
    console.log('Route changed from', oldRoute?.path, 'to', newRoute?.path);
    await this.checkSession();
  }

  async mounted() {
    await this.checkSession();

    this.$router.afterEach(async (to, from) => {
      console.log('Route changed from', from.path, 'to', to.path);
      await this.checkSession();
    });
  }
}
</script>

<template>
  <Head :username="appState.username" />
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>
