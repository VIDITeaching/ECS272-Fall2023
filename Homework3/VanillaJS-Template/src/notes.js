
var counter = 0;

export const Notes = () => (`
    <div class='card' id='note-card'>
        <div class="card-content">
            <p>
                This template uses Materialize, a UI libarary based on Google's Material Design. It is independent of any frontend frameworks (e.g., Vuetify for Vue, Materail UI for React), hence good for vanilla JavaScript projects. 
            </p>
        </div>
        <div class="card-action">
            <a class="waves-effect waves-light btn-small" id='counter-button'>Have clicked this ${counter} times</a>
        </div>
    </div>
`)

export function mountCounter(element) {
    const setCounter = (count) => {
      counter = count
      element.innerHTML = `Have clicked this ${counter} times`
    }
    element.addEventListener('click', () => setCounter(counter + 1))
}