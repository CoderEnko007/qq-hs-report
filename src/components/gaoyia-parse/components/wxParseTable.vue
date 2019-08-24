<template>
	<rich-text :nodes="nodes"></rich-text>
</template>

<script>
export default {
	name: 'wxParseTable',
	props: {
		node: {
			type: Object,
			default() {
				return {};
			},
		},
	},
	data() {
		return {
			nodes:[]
		};
	},
	mounted() {
		this.nodes=this.loadNode([this.node]);
	},
	methods: {
		loadNode(node) {
			let obj = [];
			for (let children of node) {
				// console.log(children)
				if (children.node=='element') {
					let t = {
						name:children.tag,
						attrs: {
							class: children.classStr,
							// style: children.styleStr,
						},
						children: children.nodes?this.loadNode(children.nodes):[]
					}
					
					obj.push(t)
				} else if(children.node=='text'){
					obj.push({
						type: 'text',
						text: children.text
					})
				}
			}
			return obj
		}
	}
};
</script>
<style scoped>
.table {
  width: 100%;
}
.thead, .tfoot, .tr {
  display: flex;
  flex-direction: row;
}
.tr {
  width:100%;
  display: flex;
  border-top: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  box-sizing: border-box;
}
.th,
.td {
  display: flex;
  /* width: 100%; */
  overflow: auto;
  flex: 1;
  padding: 5px;
  box-sizing: border-box;
  border-left: 1px solid #e0e0e0;
}
.td:last {
  border-top: 1px solid #e0e0e0;
  box-sizing: border-box;
}
.th {
  background: #f0f0f0;
  border-top: 1px solid #e0e0e0;
  box-sizing: border-box;
}
</style>