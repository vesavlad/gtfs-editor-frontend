<template>
  <div id="app" class="body">
    <header>
        <div class="container full grid">
            <div class="logo">
                <span>GTFS Editor</span>
            </div>
            <div class="menu">
                <router-link :to="{name: 'myprojects'}" class="btn">My Projects</router-link>
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
#app {
  height: 100vh;
}
</style>
<script>
require('material-icons')
</script>>
