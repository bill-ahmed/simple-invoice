<template>
  <div @mouseover="showEdit=true" @mouseleave="showEdit = false" id="printMe" style="width: 8.5in;" class="editor-container shadow-xl my-4 mx-auto p-16 bg-white overflow-y-auto">    
    <!-- From address -->
    <div class="flex flex-col mb-10 w-full text-black break-all whitespace-pre-wrap">
      <textarea v-if="showEdit || data.header.from.name === ''" rows="1" placeholder="Your Name" v-model="data.header.from.name"/>
      <p v-else>
        {{ data.header.from.name }}
      </p>

      <textarea v-if="showEdit || data.header.from.address === ''" rows="4" placeholder="Your Address" v-model="data.header.from.address"/>
      <p v-else>
        {{ data.header.from.address }}
      </p>
    </div>

    <!-- To address + Summary -->
    <div class="text-black flex flex-row justify-between">
      <div class="w-80 break-all whitespace-pre-wrap">
        <textarea class="w-full" v-if="showEdit || data.header.to.name === ''" rows="1" placeholder="To Name" v-model="data.header.to.name"/>
        <p v-else>
        {{ data.header.to.name }}
        </p>

        <textarea class="w-full" v-if="showEdit || data.header.to.address === ''" rows="4" placeholder="To Address" v-model="data.header.to.address"/>
        <p v-else>
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
            <td class="py-3 pr-12 break-word whitespace-pre-wrap description text-left text-sm"> 
            <textarea class="w-full" v-if="showEdit" rows="1" placeholder="To Name" v-model="item.description"/>
             <div v-else> {{item.description}} </div> 
            </td>

            
            <td class="py-3 pr-12 text-sm w-24"> 
              <input class="w-14 h-7" v-if="showEdit" rows="1" type="number" v-model="item.rate"/>
              
              <div v-else> ${{rate(item)}} </div>
            </td>
            
            <td class="py-3 pr-2 text-sm w-12"> 
              <input class="w-12 h-7" v-if="showEdit" rows="1" type="number" v-model="item.qty"/>
              <div v-else> {{item.qty}} </div>
            </td>
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

        <hr class="my-4 mb-0.5"/>
        <hr class="mb-4" />

        <div class="w-96 pl-22 flex flex-row justify-between">
          <p class="pl-14 blue-color font-semibold"> Amount Due ({{meta.currency}}) &nbsp; </p>
          <p> ${{finalTotal}} </p>
        </div>
      </div>
    </div>

    <!-- Notes -->
    <div v-if="meta.showNotes">
      <label class="blue-color font-semibold">Notes</label>

      <textarea class="w-full" v-if="showEdit || data.footer.notes === ''" rows="3" placeholder="(optional)" v-model="data.footer.notes"/>
      <p v-else class="w-full break-all whitespace-pre-wrap"> {{data.footer.notes}} </p>
    </div>
  </div>
</template>

<script>
export default {
  props: ['meta', 'data'],
  data() {
    return {
      showEdit: true   // Whether to show editor view or not
    }
  },

  methods: {
    rate(t) { return (t.rate).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") },
    lineTotal(t) { return (t.qty * t.rate).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") },
    formatDate(d) {
      let segments = d.split('-');
      return new Date(segments[0], segments[1] - 1, segments[2]).toLocaleDateString("en-US", { day: '2-digit', month: '2-digit', year: 'numeric' })
    }
  },

  computed: {
    tax() { return this.meta.tax.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") },
    amountPaid() { return this.meta.amountPaid.toFixed(2) },
    amountDueNum() {
      return this.data.body.items.reduce((p, c) => { return p + (c.rate * c.qty) }, 0.0)
    },
    amountDue() {
      return this.amountDueNum.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    totalWithTax() {
      return (this.amountDueNum * (1 + this.meta.tax)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    finalTotal() {
      let totalTax = this.amountDueNum * (1 + this.meta.tax);
      return (totalTax - this.meta.amountPaid).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  }
}
</script>

<style>
/* 
* ANY AND ALL STYLES HERE MUST ALSO 
* BE INCLUDED IN `app.css.json`, otherwise
* they will only be rendered in the preview.
*
* Try to keep these at a minimum...
*/

.blue-color { color: #4f697a; border-color: #4f697a; }

#printMe textarea {
  padding: 3px;
  margin: 2px 0;
  border: solid 1px rgba(0, 0, 0, 0.2);
}

tbody textarea {
  margin: 0;
}

tbody input {
  padding: 0 5px;
}

</style>