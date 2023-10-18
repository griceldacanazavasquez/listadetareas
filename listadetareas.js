const inputElement = document.querySelector(".new-task-input");
const addTaskButton = document.querySelector(".new-task-button");
const tasksContainer = document.querySelector(".tasks-container");
const postList = document.getElementById("post-list");

const validateInput = () => inputElement.value.trim().length > 0;

const showNotification = (message, isError = false) => {
  Toastify({
    text: message,
    duration: 3000,
    style: {
      background: isError
        ? "linear-gradient(to right, #ff0000, #ff4d4d)"
        : "linear-gradient(to right, #00b09b, #96c93d)",
    },
  }).showToast();
};

const handleAddTask = async () => {
  const inputIsValid = validateInput();

  if (!inputIsValid) {
    inputElement.classList.add("error");
    showNotification("No has escrito ninguna tarea", true);
    return;
  }

  inputElement.classList.remove("error");

  const taskItemContainer = document.createElement("div");
  taskItemContainer.classList.add("task-item");

  const taskContent = document.createElement("p");
  taskContent.innerText = inputElement.value;

  taskContent.addEventListener("click", () => handleClick(taskContent));

  const deleteItem = document.createElement("i");
  deleteItem.classList.add("far");
  deleteItem.classList.add("fa-trash-alt");
  deleteItem.classList.add("delete-icon");

  deleteItem.addEventListener("click", async () => {
    if (await handleDeleteClick(taskItemContainer, taskContent)) {
      showNotification("Tarea eliminada");
    } else {
      showNotification("Error al eliminar la tarea", true);
    }
  });

  taskItemContainer.appendChild(taskContent);
  taskItemContainer.appendChild(deleteItem);

  tasksContainer.appendChild(taskItemContainer);

  inputElement.value = "";

  try {
    obtenerPost();
    await updateLocalStorage();
    showNotification("Nueva tarea agregada");
  } catch (error) {
    showNotification("Error al agregar la tarea", true);
  }
};

const handleClick = (taskContent) => {
  const tasks = tasksContainer.childNodes;

  for (const task of tasks) {
    const currentTask = task.firstChild;

    if (currentTask && currentTask.isSameNode(taskContent)) {
      currentTask.classList.toggle("completed");
    }
  }

  updateLocalStorage().catch((error) => {
    showNotification("Error al actualizar la tarea", true);
  });
};

const handleDeleteClick = async (taskItemContainer, taskContent) => {
  const tasks = tasksContainer.childNodes;

  for (const task of tasks) {
    if (task.firstChild && task.firstChild.isSameNode(taskContent)) {
      taskItemContainer.remove();
    }
  }

  try {
    await updateLocalStorage();
    return true;
  } catch (error) {
    return false;
  }
};

const handleInputChange = () => {
  const inputIsValid = validateInput();

  if (inputIsValid) {
    inputElement.classList.remove("error");
  }
};

const updateLocalStorage = async () => {
  const tasks = tasksContainer.childNodes;

  const localStorageTasks = [...tasks].map((task) => {
    const content = task.firstChild;
    const isCompleted = content && content.classList.contains("completed");

    return { description: content.innerText, isCompleted };
  });

  try {
    await new Promise((resolve) => {
      localStorage.setItem("tasks", JSON.stringify(localStorageTasks));
      resolve();
    });
  } catch (error) {
    throw new Error("Error al actualizar el almacenamiento local");
  }
};

const refreshTasksUsingLocalStorage = () => {
  const tasksFromLocalStorage = JSON.parse(localStorage.getItem("tasks"));

  if (!tasksFromLocalStorage) return;

  for (const task of tasksFromLocalStorage) {
    const taskItemContainer = document.createElement("div");
    taskItemContainer.classList.add("task-item");

    const taskContent = document.createElement("p");
    taskContent.innerText = task.description;

    if (task.isCompleted) {
      taskContent.classList.add("completed");
    }

    taskContent.addEventListener("click", () => handleClick(taskContent));

    const deleteItem = document.createElement("i");
    deleteItem.classList.add("far");
    deleteItem.classList.add("fa-trash-alt");
    deleteItem.classList.add("delete-icon");

    deleteItem.addEventListener("click", () =>
      handleDeleteClick(taskItemContainer, taskContent)
    );

    taskItemContainer.appendChild(taskContent);
    taskItemContainer.appendChild(deleteItem);

    tasksContainer.appendChild(taskItemContainer);
  }
};

refreshTasksUsingLocalStorage();

addTaskButton.addEventListener("click", () => handleAddTask());
inputElement.addEventListener("change", () => handleInputChange());

inputElement.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleAddTask();
  }
});

// Event listener para obtener y mostrar un "post"
addTaskButton.addEventListener("click", () => obtenerPost());

async function obtenerPost() {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");
  if (!response.ok) {
    throw new Error("No se puede obtener el post");
  }

  const data = await response.json();
  mostrarPosts(data);
}

function mostrarPosts(posts) {
  const indiceAleatorio = Math.floor(Math.random() * posts.length);
  const comentarioAleatorio = posts[indiceAleatorio];

  const ul = document.createElement('ul');
  ul.classList.add('new-task-container');
  ul.style.marginTop = '20px'

  const li = document.createElement('li');
  li.classList.add('post-card');

  const title = document.createElement('h3');
  title.textContent = comentarioAleatorio.title.charAt(0).toUpperCase() + comentarioAleatorio.title.slice(1);

  const body = document.createElement('p');
  body.textContent = comentarioAleatorio.body.charAt(0).toUpperCase() + comentarioAleatorio.body.slice(1);

  li.appendChild(title);
  li.appendChild(body);

  ul.appendChild(li);

  postList.innerHTML = '';
  postList.appendChild(ul);
}
