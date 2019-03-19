let scene = new THREE.Scene();
let clock = new THREE.Clock();
let renderer = new THREE.WebGLRenderer();
let stats, container, mixer, light, controls;
let camera;

init();
loadModels();
animate();

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);


    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(100, 200, 300);

    controls = new THREE.OrbitControls(camera);
    controls.target.set(0, 100, 0);
    controls.update();

    scene.background = new THREE.Color(0xa0a0a0);

    light = new THREE.HemisphereLight(0xffffff, 0x444444);
    light.position.set(0, 200, 0);
    scene.add(light);

    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 200, 100);
    light.castShadow = true;
    light.shadow.camera.top = 180;
    light.shadow.camera.bottom = -100;
    light.shadow.camera.left = -120;
    light.shadow.camera.right = 120;
    scene.add(light);

    let mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000, 2000), new THREE.MeshPhongMaterial({color: 0x999999, depthWrite: false}));
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);

    let grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);

    stats = new Stats();
    container.appendChild(stats.dom);
}

function loadModels() {

    let textureLoader = new THREE.TextureLoader();
    let modelLoader = new THREE.FBXLoader();

    let catTexture = textureLoader.load('textures/Joven_AlbedoTransparency.png');

    modelLoader.load('models/Joven_Animations.fbx', (model) => {
        mixer = new THREE.AnimationMixer(model);
        let action = mixer.clipAction(model.animations[0]);
        action.play();
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.recieveShadow = true;
                child.material.map = catTexture;
                child.material.needsUpdate = true;
            }
        });
         scene.add(model);
    });


    let bottleTexture = textureLoader.load('textures/BottleSticker.png');

    modelLoader.load('models/Bottle.fbx', (model) => {
        let scaleVector = new THREE.Vector3(5, 5, 5);
        let scale = Object.assign({}, scaleVector);
        model.scale.set(scale.x, scale.y, scale.z);
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.recieveShadow = true;
                child.material.map = bottleTexture;
                child.material.needsUpdate = true;
            }
        });

        //scene.add(model);
    });

}


function animate() {
    requestAnimationFrame(animate);
    let delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    renderer.render(scene, camera);

    stats.update();
}
