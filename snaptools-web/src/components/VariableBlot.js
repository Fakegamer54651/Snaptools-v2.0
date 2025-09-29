import Quill from 'quill';

const Inline = Quill.import('blots/inline');
const Embed = Quill.import('blots/embed');

class VariableBlot extends Embed {
  static blotName = 'variable';
  static tagName = 'span';
  static className = 'ql-variable';

  static create(value) {
    const node = super.create();
    node.setAttribute('data-var', value.name);
    node.setAttribute('contenteditable', 'false');
    node.textContent = value.text;
    node.classList.add('ql-variable');
    return node;
  }

  static formats(node) {
    return {
      name: node.getAttribute('data-var'),
      text: node.textContent
    };
  }

  static value(node) {
    return {
      name: node.getAttribute('data-var'),
      text: node.textContent
    };
  }

  // Enable this blot to accept formatting
  static allowedChildren = [];
  
  // Allow the variable to be wrapped by formatting blots
  static scope = Quill.import('parchment').Scope.INLINE;

  // Override length to ensure proper cursor behavior
  length() {
    return 1;
  }

  // Make sure variables preserve their properties
  optimize(context) {
    super.optimize(context);
    
    // Ensure class and attributes are preserved
    if (!this.domNode.classList.contains('ql-variable')) {
      this.domNode.classList.add('ql-variable');
    }
    
    if (this.domNode.getAttribute('contenteditable') !== 'false') {
      this.domNode.setAttribute('contenteditable', 'false');
    }
  }

  // Handle HTML serialization for output
  html() {
    const value = this.constructor.value(this.domNode);
    if (value && value.name && value.text) {
      return `<span class="ql-variable" data-var="${value.name}" contenteditable="false">${value.text}</span>`;
    }
    return this.domNode.outerHTML;
  }

  // Handle deletion behavior
  deleteAt(index, length) {
    // Always delete the entire variable as one unit
    this.remove();
  }
}

// Alternative Inline version for better formatting support
class VariableInlineBlot extends Inline {
  static blotName = 'variableInline';
  static tagName = 'span';
  static className = 'ql-variable';

  static create(value) {
    const node = super.create();
    node.setAttribute('data-var', value.name);
    node.setAttribute('contenteditable', 'false');
    node.textContent = value.text;
    return node;
  }

  static formats(node) {
    const formats = super.formats(node);
    return {
      ...formats,
      variable: {
        name: node.getAttribute('data-var'),
        text: node.textContent
      }
    };
  }

  format(name, value) {
    if (name === 'variable') {
      this.domNode.setAttribute('data-var', value.name);
      this.domNode.textContent = value.text;
    } else {
      super.format(name, value);
    }
  }

  optimize(context) {
    super.optimize(context);
    
    // Ensure attributes are preserved
    if (this.domNode.getAttribute('contenteditable') !== 'false') {
      this.domNode.setAttribute('contenteditable', 'false');
    }
  }
}

// Register both blots - use embed by default
Quill.register('formats/variable', VariableBlot);
Quill.register('formats/variableInline', VariableInlineBlot);

export default VariableBlot;
