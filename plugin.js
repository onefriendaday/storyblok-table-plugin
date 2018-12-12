const Fieldtype = {
  template: `
<div>
  <button v-if="!open" class="uk-width-1-1 uk-button" v-on:click.prevent="openOverlay">Edit Table</button>
  <div v-if="open">
    <div class=uk-clearfix>
      <div class=uk-float-right><a v-on:click="close" class="uk-button"><i class="uk-icon-close"></i> Ready</a></div>
      <h1 class=overlay__headline>Table</h1>
    </div>
    <div class="overlay__list" style="padding: 50px 58px">
      <div class="uk-position-relative">
        <table class="uk-table uk-table-hover plugin__tabledata">
          <thead>
            <tr>
              <th :key="index" v-for="(th, index) in model.thead">
                <div style="position: absolute; top: -20px">
                  <a v-on:click="removeCol(index)" style="margin-right: 8px"><i class="uk-icon-close"></i></a>
                  <a v-on:click="moveCol(index, -1)" style="margin-right: 8px"><i class="uk-icon-caret-left"></i></a>
                  <a v-on:click="moveCol(index, 1)"><i class="uk-icon-caret-right"></i></a>
                </div>
                <textarea @focus=autogrowFn @blur=resetFn @input=autogrowFn($event) v-model=th.value type="text" class="uk-width-1-1" rows="1" style="overflow-y: scroll; height: 42px;"></textarea>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr :key="trkey" v-for="(tr, trkey) in model.tbody">
              <td :key="index" v-for="(td, index) in tr.body">
                <div v-if="!index" style="position: absolute; left: -56px">
                  <a v-on:click="removeRow(trkey)" style="margin-right: 8px"><i class="uk-icon-close"></i></a>
                  <a v-on:click="moveRow(trkey, 1)" style="margin-right: 8px"><i class="uk-icon-caret-down"></i></a>
                  <a v-on:click="moveRow(trkey, -1)" style="margin-right: 8px"><i class="uk-icon-caret-up"></i></a><br>
                  <a v-on:click="addRow(trkey)"><i class="uk-icon-plus"></i></a>
                </div>
                <textarea @focus=autogrowFn @blur=resetFn @input=autogrowFn($event) v-model=td.value type="text" class="uk-width-1-1" rows="1"></textarea>
              </td>
            </tr>
          </tbody>
        </table>
        <button v-on:click.prevent="addRow('last')" class="uk-button">Add Row</button>
        <button v-on:click.prevent="addCol" style="position: absolute;right: -80px;top: 35px;transform: rotate(90deg);width: 100px" class="uk-button">Add Col</button>
      </div>
      <div style=margin-top:50px>JSON-Output: {{model}}</div>
    </div>
  </div>
</div>
  `,
  mixins: [window.Storyblok.plugin],
  computed: {
    cols: function cols() {
      if (this.model) {
        return this.model.thead.length;
      }
      return 0;
    }
  },
  data: function data() {
    return {
      open: false
    };
  },
  methods: {
    initWith() {
      return {
        plugin: 'translateable-table',
        thead: [
          {value: 'Head1'},
          {value: 'Head2'}
        ],
        tbody: [
          {
            component: '_table_row',
            body: [
              {
                component: '_table_col',
                value: 'one'
              },
              {
                component: '_table_col',
                value: 'two'
              }
            ]
          }
        ]
      }
    },
    resetFn: function resetFn(e) {
      var textarea = e.currentTarget;
      textarea.style.overflowY = 'scroll';
      textarea.style.height = '42px';
    },
    autogrowFn: function autogrowFn(e) {
      var maxAllowedHeight = 300;
      var newHeight = 0;
      var hasGrown = false;
      var textarea = e.currentTarget;

      if (textarea.scrollHeight > maxAllowedHeight) {
        textarea.style.overflowY = 'scroll';
        newHeight = maxAllowedHeight;
      } else {
        textarea.style.overflowY = 'hidden';
        textarea.style.height = 'auto';
        newHeight = textarea.scrollHeight + 2;
        hasGrown = true;
      }

      textarea.style.height = newHeight + 'px';
      return hasGrown;
    },
    moveRow: function moveRow(index, offset) {
      this.move(this.model.tbody, index, offset);
    },
    move: function move(elements, index, offset) {
      var newIndex = index + offset;

      if (newIndex > -1 && newIndex < elements.length) {
        var removedElement = elements.splice(index, 1)[0];
        elements.splice(newIndex, 0, removedElement);
      }
    },
    moveCol: function moveCol(index, offset) {
      var _this = this;

      this.move(this.model.thead, index, offset);
      this.model.tbody.forEach(function (item) {
        _this.move(item.body, index, offset);
      });
    },
    close: function close() {
      this.$emit('toggle-modal', false)
      this.open = false;
    },
    openOverlay: function openOverlay() {
      this.$emit('toggle-modal', true)
      this.open = true;
    },
    addRow: function addRow(index) {
      var row = {component: '_table_row', body: []};
      for (var i = 0; i < this.cols; i++) {
        row.body[i] = {component: '_table_col', value: ''};
      }

      if (index !== 'last') {
        this.model.tbody.splice(index + 1, 0, row);
      } else {
        this.model.tbody.push(row);
      }
    },
    addCol: function addCol() {
      this.model.thead.push({value: 'Title'});
      this.model.tbody.forEach(function (item) {
        item.body.push({component: '_table_col', value: ''});
      });
    },
    removeCol: function removeCol(index) {
      this.model.thead.splice(index, 1);
      this.model.tbody.forEach(function (item) {
        item.body.splice(index, 1);
      });
    },
    removeRow: function removeRow(index) {
      this.model.tbody.splice(index, 1);
    }
  },
  watch: {
    'model': {
      handler: function (value) {
        this.$emit('changed-model', value);
      },
      deep: true
    }
  }
}
