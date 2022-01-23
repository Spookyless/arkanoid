import BoxCollider from "./BoxCollider.js";
import Brick from "./Brick.js";
import Entity from "./Entity.js";
import GameBoard from "./GameBoard.js";
import Paddle from "./Paddle.js";
import SphereCollider from "./SphereCollider.js";
import Vector2 from "./Vector2.js";

export default class Ball extends Entity {
    /**
     * @param {string} spritePath
     * @param {number} spriteX
     * @param {number} spriteY
     * @param {number} spriteWidth
     * @param {number} spriteHeight
     * @param {Vector2} position
     * @param {number} scale
     * @param {Vector2} direction
     * @param {number} speed
     * @param {GameBoard} gameBoard
     */
    constructor(spritePath, spriteX, spriteY, spriteWidth, spriteHeight, position, scale, direction, speed, gameBoard) {
        super(spritePath, spriteX, spriteY, spriteWidth, spriteHeight, position, scale);

        this.direction = direction.normalize();
        this.speed = speed * scale;

        this.gameBoard = gameBoard;

        this.collider = new SphereCollider(this.position, new Vector2(this.width / 2, this.height / 2), this.width / 2 + 1);
    }

    /**
     * @param {number} delta
     * @param {BoxCollider[]} pipes
     * @param {Paddle} paddle
     */
    update(delta, pipes, paddle) {
        this.collider.update(this.position);

        this.moveWithCollisionCheck(delta, pipes, paddle);
    }

    /**
     * @param {BoxCollider[]} pipes
     * @param {number} delta
     * @param {Paddle} paddle
     */
    moveWithCollisionCheck(delta, pipes, paddle) {
        let amountToMove = delta * this.speed;
        let amountToMoveEachStep = amountToMove / 10;

        let collisionCount = 0;
        let maxCollisions = 5;

        outer: while (amountToMove > 0 && collisionCount < maxCollisions) {
            if (collisionCount != 0) {
                this.gameBoard.removeDeadBricks();
            }

            let predictedPosition = this.position.clone().add(this.direction.clone().multiply(amountToMoveEachStep));
            let predictedPositionCenter = predictedPosition.clone().add(this.collider.offset);

            let result = this.collider.checkCollisionWithBox(paddle.collider, predictedPositionCenter);

            if (result) {
                if (result.type === "edge") {
                    if (result.direction === "left" || result.direction === "right") {
                        this.direction.reflectX();
                    } else {
                        if (result.direction === "top") {
                            let angle = paddle.getAngleFromZone(predictedPositionCenter.x);
                            this.direction.setFromAngle(angle);
                        } else {
                            this.direction.reflectY();
                        }
                    }
                }

                collisionCount++;
                continue outer;
            }

            for (const pipe of pipes) {
                let result = this.collider.checkCollisionWithBox(pipe, predictedPositionCenter);

                if (result) {
                    if (result.type === "edge") {
                        if (result.direction === "left" || result.direction === "right") {
                            this.direction.reflectX();
                        } else {
                            this.direction.reflectY();
                        }
                    }

                    collisionCount++;
                    continue outer;
                }
            };

            let predictedPositionToCell = this.gameBoard.localToCell(predictedPositionCenter.x, predictedPositionCenter.y);

            if (predictedPositionToCell) {
                let canCollide = this.gameBoard.cellRegion(predictedPositionToCell.x, predictedPositionToCell.y, 1);

                for (const arr of canCollide) {
                    for (const brick of arr) {
                        if (brick instanceof Brick) {
                            let result = this.collider.checkCollisionWithBox(brick.collider, predictedPositionCenter);

                            if (result) {
                                brick.damage();

                                if (result.type === "edge") {
                                    if (result.direction === "left" || result.direction === "right") {
                                        this.direction.reflectX();
                                    } else {
                                        this.direction.reflectY();
                                    }
                                } else {
                                    if (result.direction === "left" || result.direction === "right") {
                                        this.direction.reflectX();
                                    } else {
                                        this.direction.reflectY();
                                    }
                                }

                                collisionCount++;
                                continue outer;
                            }
                        }
                    }
                }
            }

            //move
            this.position.add(this.direction.clone().multiply(amountToMoveEachStep));
            amountToMove -= amountToMoveEachStep;
            this.collider.update(this.position);

            if (collisionCount === maxCollisions) {
                break;
            }
        }

        // if (collided === false) {
        //     this.position.add(this.direction.clone().multiply(delta * this.speed));
        //     this.collider.update(this.position);
        // }
    }
}