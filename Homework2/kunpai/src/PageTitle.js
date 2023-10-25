export const Title = () => (`
    <div class="navbar-fixed" id= "navbar-web">
        <nav>
            <div class="nav-wrapper">
                <a href="#" class="brand-logo left">Pokémon</a>
            </div>
        </nav>
    </div>
`)

export function mountTitle() {
    document.querySelector('#navbar-web').innerHTML = Title();
}