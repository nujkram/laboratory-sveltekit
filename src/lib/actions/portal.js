// Moves a node to <body> so it escapes any transformed / fixed ancestors.
//
// The report modal needs this for printing: the print stylesheet hides every
// direct child of <body> except #print-record-modal, and the report itself
// renders as a normal in-flow block so a long CBC paginates. Left nested inside
// the modal's fixed wrappers it would be clipped to a single page instead.
export function portal(node) {
	if (typeof document === 'undefined') return {};
	document.body.appendChild(node);
	return {
		destroy() {
			if (node.parentNode) node.parentNode.removeChild(node);
		}
	};
}
