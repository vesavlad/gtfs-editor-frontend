<template>
    <select class="select-simple" ref="select" v-model="val">
        <option v-for="(option, key) in field.options" :key="key" :value="option">{{key}}</option>
    </select>
</template>
<script>
    import $ from 'jquery';
    import 'select2';
    export default {
        props: {
            properties: {
                type: Object
            }
        },
        computed: {
            field() {
                return this.properties.rowField;
            },
            data() {
                return this.properties.rowData;
            },
            rowID() {
                return this.properties.rowData.id;
            }
        },
        watch: {
            rowID() {
                this.changeEnabled = false;
                $(this.$refs.select).select2('destroy');
                this.val = this.data[this.name];
                this.$nextTick(this.datafy);
                this.changeEnabled = true;
            }
        },
        data() {
            return {
                changeEnabled: true,
                val: this.properties.rowData[this.properties.rowField.name],
                name: this.properties.rowField.name,
            }
        },
        mounted() {
            this.datafy();
            $(this.$refs.select).on('change', this.onChange);
        },
        methods: {
            onChange(evt) {
                if (this.changeEnabled) {
                    this.$emit('change', {
                        val: evt.target.value,
                    });
                }
            },
            log(msg) {
                console.log(msg);
            },
            datafy() {
                let select = this.$refs.select;
                $(select).select2();
            },
        },
    }
</script>