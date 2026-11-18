
import Game from "../core/Game.js";
import Input from "../core/Input.js";

import AtomManager from "../systems/AtomManager.js";
import ProjectileManager from "../systems/ProjectileManager.js";
import CollisionManager from "../systems/CollisionManager.js";
import CannonManager from "../systems/CannonManager.js";
import GameScoreManager from "../systems/ScoreManager.js";
import LevelManager from "../systems/LevelManager.js";

import GameRenderer from "../systems/GameRenderer.js";

import { DEFAULT_LEVEL } from "../config/levels.js";

export default class NuclearGame extends Game {

    constructor(canvas) {
        super(canvas);

        // =====================================
        // Game State
        // =====================================

        this.input = new Input();

        this.levelComplete = false;
        this.finalScore = 0;
        this.currentLevel = DEFAULT_LEVEL;

        // =====================================
        // Atom Settings
        // =====================================

        this.atomCount = 5;
        this.atomHealth = 1;
        this.atoms = [];

        // =====================================
        // Temperature Settings
        // =====================================

        this.minTemperature = 298;
        this.maxTemperature = 798;
        this.temperature = 298;

        // =====================================
        // Cannon Settings
        // =====================================

        this.cannon = {
            x: canvas.width / 2,
            y: canvas.height,
            angle: -Math.PI / 2,
            rotationSpeed: 2,
            barrelLength: 50,

            color: "#555555",
            emoji: ""
        };

        // =====================================
        // Projectile Settings
        // =====================================

        this.projectiles = [];

        this.projectileSpeed = 400;
        this.projectileRadius = 5;

        this.fireCooldown = 0;
        this.fireRate = 0.4;

        // =====================================
        // Initialize Systems
        // =====================================

        this.atomManager = new AtomManager(this);

        this.projectileManager =
            new ProjectileManager(this);

        this.collisionManager =
            new CollisionManager(this);

        this.cannonManager =
            new CannonManager(this);

        this.scoreManager =
            new GameScoreManager(this);

        this.levelManager =
            new LevelManager(this);

        this.renderer = new GameRenderer(this);

        // =====================================
        // Initialize Game
        // =====================================

        this.atomManager.createAtoms(this.atomCount);
        this.resetScore();
    }

    // =========================================
    // Level Management
    // =========================================

    setLevel(level) {
        this.levelManager.setLevel(level);
    }

    showCustomizationControls() {
        return this.levelManager.showCustomizationControls();
    }

    checkLevelCompletion() {
        this.levelManager.checkCompletion();
    }

    // =========================================
    // Cannon Customization
    // =========================================

    setCannonColor(color) {
        this.cannonManager.setColor(color);
    }

    setCannonEmoji(emoji) {
        this.cannonManager.setEmoji(emoji);
    }

    resetCannonAppearance() {
        this.cannonManager.resetAppearance();
    }

    // =========================================
    // Game State
    // =========================================

        start() {
        this.levelComplete = false;
        this.finalScore = 0;

        super.start();
    }

    restart() {
        this.levelManager.restart();
    }

    // =========================================
    // Temperature
    // =========================================

    setTemperature(value) {
        this.temperature = Math.max(
            this.minTemperature,
            Math.min(this.maxTemperature, value)
        );
    }

    getTemperatureFactor() {
        return (
            (this.temperature - this.minTemperature) /
            (this.maxTemperature - this.minTemperature)
        );
    }

    // =========================================
    // Atom Management
    // =========================================

    createAtoms(number) {
        this.atomManager.createAtoms(number);
    }

    createAtom() {
        return this.atomManager.createAtom();
    }

    resetAtoms() {
        this.atomManager.resetAtoms();
    }

    setAtomCount(number) {
        this.atomManager.setAtomCount(number);
    }

    damageAtom(atom) {
        this.atomManager.damageAtom(atom);
    }

    removeAtom(atom) {
        this.atomManager.removeAtom(atom);
    }

    // =========================================
    // Scoring
    // =========================================

    resetScore() {
        this.scoreManager.reset();
    }

    updateScore() {
        this.scoreManager.update();
    }

    // =========================================
    // Cannon Controls
    // =========================================

    updateCannon(deltaTime) {
        this.cannonManager.update(deltaTime);
    }

    updateFiring(deltaTime) {
        this.cannonManager.updateFiring(deltaTime);
    }

    // =========================================
    // Projectile Management
    // =========================================

    fireProjectile() {
        this.projectileManager.fire();
    }

    updateProjectiles(deltaTime) {
        this.projectileManager.update(deltaTime);
    }

    updateAttachedProjectile(projectile) {
        this.projectileManager.updateAttached(projectile);
    }

    attachProjectile(projectile, atom) {
        this.projectileManager.attach(projectile, atom);
    }

    // =========================================
    // Atom Movement
    // =========================================

    moveAtoms(deltaTime) {
        this.atomManager.moveAtoms(deltaTime);
    }

    checkAtomBoundaries(atom) {
        this.atomManager.checkBoundaries(atom);
    }

    // =========================================
    // Collision Detection
    // =========================================

    getDistance(x1, y1, x2, y2) {
        return this.collisionManager.getDistance(
            x1,
            y1,
            x2,
            y2
        );
    }

    checkAtomCollisions() {
        this.collisionManager.checkAtomCollisions();
    }

    resolveAtomCollision(a, b) {
        this.collisionManager.resolveAtomCollision(a, b);
    }

    checkProjectileCollisions() {
        this.collisionManager.checkProjectileCollisions();
    }

    // =========================================
    // Game Update
    // =========================================

    update(deltaTime) {
        if (this.levelComplete) return;

        this.updateCannon(deltaTime);

        this.updateProjectiles(deltaTime);

        this.moveAtoms(deltaTime);

        this.checkAtomCollisions();

        this.checkProjectileCollisions();

        this.updateScore();

        this.checkLevelCompletion();
    }

    // =========================================
    // Drawing
    // =========================================

    draw() {
        super.draw();

        this.renderer.draw();
    }
}
