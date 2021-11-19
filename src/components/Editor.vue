<template>
  <div id="printMe" style="width: 8.5in" class="editor-container shadow-xl my-4 mx-auto p-16 bg-white overflow-y-auto">
    <!-- From address -->
    <div class="mb-10 whitespace-pre">
      <p>
        {{ data.header.from.name }}
      </p>
      <p>
        {{ data.header.from.address }}
      </p>
    </div>

    <!-- To address + Summary -->
    <div class="flex flex-row justify-between">
      <div class="whitespace-pre">
        <p>
        {{ data.header.to.name }}
        </p>
        <p>
          {{ data.header.to.address }}
        </p>
      </div>

      <!-- Invoice summary -->
      <div class="flex flex-col blue-color font-semibold">
        <div class="flex flex-row justify-between">
          <p> Invoice Number </p>
          <p> {{meta.id}} </p>
        </div>

        <div class="flex flex-row justify-between">
          <p> Date of Issue </p>
          <p> {{meta.dateOfIssue}} </p>
        </div>

        <div class="flex flex-row justify-between">
          <p> Due Date </p>
          <p> {{meta.dueDate}} </p>
        </div>

        <div class="flex flex-row justify-between">
          <p> Amount Due ({{meta.currency}}) &nbsp; </p>
          <p> ${{amountDue}} </p>
        </div>
      </div>
    </div>

    <hr class="my-2 mt-8 border-t-4 blue-color"/>

    <!-- Main body -->
    <div class="mb-12">
      <table class="w-full">
        <thead class="text-right blue-color">
          <th class="text-left"> Description </th>
          <th class="pr-4"> Rate </th>
          <th class="pr-4"> Qty </th>
          <th> Line Total </th>
        </thead>
        
        <div class="mb-1"/>

        <tbody>
          <tr 
            v-for="(item, index) in data.body.items" 
            :key="index"
            class="text-right" style="border-bottom: solid 1px #E5E5E5"
          > 
            <td class="py-3 pr-24 description text-left text-sm"> {{item.description}} </td>
            <td class="py-3 pr-4 text-sm w-24"> ${{rate(item)}} </td>
            <td class="py-3 pr-4 text-sm w-12"> {{qty(item)}} </td>
            <td class="py-3 text-sm w-24"> ${{lineTotal(item)}} </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Subtotals -->
    <div class="flex flex-row justify-end mb-12">
      <div class="flex flex-col">
        <div class="flex flex-row justify-between"> 
          <p> Subtotal </p> 
          <p> ${{amountDue}} </p>
        </div>
        
        <div class="flex flex-row justify-between">
          <p> Tax </p>
          <p> ${{tax}} </p>
        </div>

        <hr class="my-2"/>

        <div class="flex flex-row justify-between">
          <p>Total</p>
          <p> ${{totalWithTax}} </p>
        </div>

        <div class="flex flex-row justify-between">
          <p> Amount Paid </p>
          <p> ${{amountPaid}} </p>
        </div>

        <hr class="my-4"/>

        <div class="flex flex-row justify-between w-72">
          <p class="blue-color font-semibold"> Amount Due ({{meta.currency}}) &nbsp; </p>
          <p> ${{finalTotal}} </p>
        </div>
      </div>
    </div>

    <!-- Notes -->
    <div>
      <label class="blue-color font-semibold">Notes</label>
      <p class="whitespace-pre"> {{data.footer.notes}} </p>
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
    qty(t) { return t.qty.toFixed(1) },
    lineTotal(t) { return (t.qty * t.rate).toFixed(2) },
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