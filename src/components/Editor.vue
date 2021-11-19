<template>
  <div id="printMe" style="width: 8.5in;" class="editor-container shadow-xl my-4 mx-auto p-16 bg-white overflow-y-auto">
    <!-- From address -->
    <div class="mb-10 text-black whitespace-pre-wrap">
      <p>
        {{ data.header.from.name }}
      </p>
      <p>
        {{ data.header.from.address }}
      </p>
    </div>

    <!-- To address + Summary -->
    <div class="text-black flex flex-row justify-between">
      <div class="w-80 whitespace-pre-wrap">
        <p>
        {{ data.header.to.name }}
        </p>
        <p>
          {{ data.header.to.address }}
        </p>
      </div>

      <!-- Invoice summary -->
      <div class="flex flex-col blue-color">
        <div class="flex flex-row justify-between">
          <p> Invoice Number </p>
          <p class="text-black"> {{meta.id}} </p>
        </div>

        <div class="flex flex-row justify-between">
          <p> Date of Issue </p>
          <p class="text-black"> {{formatDate(meta.dateIssue)}} </p>
        </div>

        <div class="flex flex-row justify-between">
          <p> Due Date </p>
          <p class="text-black"> {{formatDate(meta.dateDue)}} </p>
        </div>

        <hr class="mt-2 mb-1 border-b-2 blue-color"/>

        <div class="flex flex-row justify-between items-baseline">
          <p> Amount Due ({{meta.currency}}) &nbsp; </p>
          <p class="ml-10 text-2xl text-black font-medium"> ${{amountDue}} </p>
        </div>
      </div>
    </div>

    <hr class="my-2 mt-8 border-t-4 blue-color"/>

    <!-- Main body -->
    <div class="mb-12">
      <table class="w-full">
        <thead class="text-right blue-color">
          <th class="text-left"> {{meta.headers.description}} </th>
          <th class="pr-12"> {{meta.headers.amount}} </th>
          <th class="pr-2"> {{meta.headers.qty}} </th>
          <th> {{meta.headers.lineTotal}} </th>
        </thead>
        
        <div class="mb-1"/>

        <tbody>
          <tr 
            v-for="(item, index) in data.body.items" 
            :key="index"
            class="text-right border-b-2 border-gray-200" 
          > 
            <td class="py-3 pr-12 whitespace-pre-wrap description text-left text-sm"> {{item.description}} </td>
            <td class="py-3 pr-12 text-sm w-24"> ${{rate(item)}} </td>
            <td class="py-3 pr-2 text-sm w-12"> {{item.qty}} </td>
            <td class="py-3 text-sm w-24"> ${{lineTotal(item)}} </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Subtotals -->
    <div class="flex flex-row justify-end mb-12">
      <div class="flex flex-col">
        <div class="w-96 pl-24 text-right flex flex-row justify-between"> 
          <p class="w-24"> Subtotal </p> 
          <p> ${{amountDue}} </p>
        </div>
        
        <div class="w-96 pl-24 text-right flex flex-row justify-between">
          <p class="w-24"> Tax </p>
          <p> ${{tax}} </p>
        </div>

        <hr class="my-2"/>

        <div class="w-96 pl-24 text-right flex flex-row justify-between">
          <p class="w-24">Total</p>
          <p> ${{totalWithTax}} </p>
        </div>

        <div class="w-96 pl-24 text-right flex flex-row justify-between">
          <p class="w-24"> Amount Paid </p>
          <p> ${{amountPaid}} </p>
        </div>

        <hr class="my-4 mb-1"/>
        <hr class="mb-4" />

        <div class="w-96 pl-22 flex flex-row justify-between">
          <p class="pl-14 blue-color font-semibold"> Amount Due ({{meta.currency}}) &nbsp; </p>
          <p> ${{finalTotal}} </p>
        </div>
      </div>
    </div>

    <!-- Notes -->
    <div>
      <label class="blue-color font-semibold">Notes</label>
      <p class="whitespace-pre-wrap"> {{data.footer.notes}} </p>
    </div>
  </div>
</template>

<script>
export default {
  props: ['meta', 'data'],
  data() {
    return { }
  },

  methods: {
    rate(t) { return (t.rate).toFixed(2) },
    lineTotal(t) { return (t.qty * t.rate).toFixed(2) },
    formatDate(d) {
      let segments = d.split('-');
      return new Date(segments[0], segments[1], segments[2]).toLocaleDateString("en-US")
    }
  },

  computed: {
    tax() { return this.meta.tax.toFixed(2) },
    amountPaid() { return this.meta.amountPaid.toFixed(2) },
    amountDue() {
      return this.data.body.items.reduce((p, c) => { return p + (c.rate * c.qty) }, 0.0).toFixed(2)
    },
    totalWithTax() {
      return (this.amountDue * (1 + this.meta.tax)).toFixed(2);
    },
    finalTotal() {
      let totalTax = this.amountDue * (1 + this.meta.tax);
      return (totalTax - this.meta.amountPaid).toFixed(2);
    }
  }
}
</script>

<style>
/* 
* ANY AND ALL STYLES HERE MUST ALSO 
* BE INCLUDED IN `app.css.json`
*
* Try to keep these at a minimum...
*/

.blue-color { color: #4f697a; border-color: #4f697a; }

</style>