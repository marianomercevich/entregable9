const socket = io();
const table = document.getElementById('realProductsTable');

document.getElementById('createBtn').addEventListener('click', () => {
  const body = {
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    price: document.getElementById('price').value,
    code: document.getElementById('code').value,
    stock: document.getElementById('stock').value,
    category: document.getElementById('category').value,
  };

  fetch('/api/products', {
    method: 'post',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(result => result.json())
    .then(result => {
      if (result.status === 'error') throw new Error(result.error);
    })
    .then(() => fetch('/api/products'))
    .then(result => result.json())
    .then(result => {
      if (result.status === 'error') throw new Error(result.error);
      socket.emit('productList', result.products); // Emitir los datos del producto creado
      alert('El producto ha sido agregado');
      document.getElementById('title').value = '';
      document.getElementById('description').value = '';
      document.getElementById('price').value = '';
      document.getElementById('code').value = '';
      document.getElementById('stock').value = '';
      document.getElementById('category').value = '';
    })
    .catch(err => alert(`Ocurrió un error: ${err}`));
});

deleteProduct = (id) => {
  const body = { id: id }; // Crear objeto body con el ID del producto

  fetch(`/api/products/${id}`, {
    method: 'delete',
  })
    .then(result => result.json())
    .then(result => {
      if (result.status === 'error') throw new Error(result.error);
      socket.emit('productList', body);
      alert('¡Producto eliminado!');
    })
    .catch(err => alert(`Ocurrió un error: ${err}`));
}

socket.on('updateProducts', data => {
  table.innerHTML =
    `<tr>
      <td>Producto</td>
      <td>Descripción</td>
      <td>Precio</td>
      <td>Código</td>
      <td>Stock</td>
      <td>Categoría</td>
    </tr>`;

  for (product of data) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><button class="btn btn-danger" onclick="deleteProduct(${product.id})">Eliminar</button></td>
      <td>${product.title}</td>
      <td>${product.description}</td>
      <td>${product.price}</td>
      <td>${product.code}</td>
      <td>${product.stock}</td>
      <td>${product.category}</td>`;
    table.getElementsByTagName('tbody')[0].appendChild(tr);
  }
});