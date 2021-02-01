<template>
  <div id="app" class="body">
    <header>
      <div class="container full grid">
        <div class="logo">
          <span>{{ $t('appName') }}</span>
        </div>
        <div class="menu">
          <locale-switcher />
          <router-link :to="{name: 'myprojects'}" class="btn">{{ $t('myProjects') }}</router-link>
        </div>
      </div>
    </header>
    <div class="container full main">
      <Breadcrumbs></Breadcrumbs>
      <router-view/>
    </div>
  </div>
</template>

<style scoped>


@import "../node_modules/material-icons/css/material-icons.css";
@import "./assets/css/base.css";
@import "./assets/css/style.css";
@import "./assets/css/temp.css";
@import "../node_modules/select2/dist/css/select2.min.css";
@import url("https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css");

</style>

<script>
import LocaleSwitcher from './components/LocaleSwitcher'

require('material-icons')

export default {
  name: 'App',
  components: {
    LocaleSwitcher
  }
}
</script>>
