<template>
  <div @click="close" class="modal">
    <!-- Modal content -->
    <div @click.stop="" class="w-1/2 p-5 bg-white shadow-2xl rounded-md">
      <h2> Help </h2>
      <br/>

      <h3> Importing data </h3>
      <p class="mb-4"> 
        To populate the invoice, you can either manually add rows or import data in a CSV format. The file must contain the description, rate and quantity.
        All other values are calculated dynamically.
      </p>

      <div class="mb-4"> Here is an example of a valid file <code class="p-0.5 bg-gray-200">my_invoice.csv</code>: </div>
      
      <code>
        <pre class="p-3 rounded-md bg-gray-200">
Working on lorum ipsum, 33, 1 
"A longer description separated by commas, such as here, here, and here.", 33, 3
item 3, 10.5, 3
item 4, 11.5, 4.4
item 5, 12.5, 5
item 6, 13.5, 6.6
item 7, 14.5, 7
item 8, 15.5, 8.6</pre>
      </code>

      <p class="mt-4"> <b>Note:</b> Do not include a header row! </p>

      <!-- Modal actions -->
      <div class="my-4 row justify-end">
        <button @click="close" class="btn-bare btn-outlined"> Back </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    close() { this.$emit('close'); }
  }
}
</script>

<style>

</style>