<template>
  <div id="app" class="body">
    <header>
        <div class="container full grid">
            <div class="logo">
                <img src="@/assets/img/logo.svg" />
            </div>
            <div class="top-menu">
                <locale-switcher />
                <router-link :to="{name: 'myprojects'}" class="btn-top"><span>{{$t('myProjects')}}</span><i class="material-icons">layers</i></router-link>
                <button class="btn-top"><span>{{ $t('website') }}</span><i class="material-icons">public</i></button>
                <button class="btn-top"><span>{{ $t('contact') }}</span><i class="material-icons">mail</i></button>
            </div>
        </div>
    </header>
    <div class="supercontent">
        <div class="container">
            <Breadcrumbs></Breadcrumbs>
        </div>
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
