let characters = [];
let player1Character = null;
let player2Character = null;
let currentPlayer = 1;
let opponent = 2;
let turnCount = 1;
let gameActive = false;
let lastAction = null;
let player1Stats = { damageDealt: 0, techniquesUsed: 0 };
let player2Stats = { damageDealt: 0, techniquesUsed: 0 };

// Fonctions d'initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Déterminer sur quelle page nous sommes
    const isSelectionPage = document.querySelector('.selection-page');
    const isArenaPage = document.querySelector('.arena-page');
    
    // Charger les données des personnages
    fetch('characters.json')
        .then(response => response.json())
        .then(data => {
            characters = data;
            
            if (isSelectionPage) {
                initSelectionPage();
            } else if (isArenaPage) {
                initArenaPage();
            }
        })
        .catch(error => {
            console.error('Erreur lors du chargement des personnages:', error);
            alert('Erreur lors du chargement des personnages. Veuillez rafraîchir la page.');
        });
});

function initSelectionPage() {
    // Générer les cartes de personnages
    const charactersGrid = document.getElementById('characters-grid');
    
    if (!charactersGrid) return;
    
    characters.forEach(character => {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.dataset.id = character.id;
        
        card.innerHTML = `
            <img src="${character.images.portrait}" alt="${character.name}">
            <div class="character-card-info">
                <h4>${character.name}</h4>
                <p>${character.class}</p>
            </div>
        `;
        
        card.addEventListener('click', () => selectCharacter(character));
        charactersGrid.appendChild(card);
    });
    
    // Configurer le bouton de démarrage
    const startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.addEventListener('click', startGame);
    }
}

function initArenaPage() {
    // Récupérer les personnages sélectionnés depuis le localStorage
    const player1Id = localStorage.getItem('player1Character');
    const player2Id = localStorage.getItem('player2Character');
    
    if (!player1Id || !player2Id) {
        window.location.href = 'selection.html';
        return;
    }
    
    player1Character = characters.find(c => c.id === parseInt(player1Id));
    player2Character = characters.find(c => c.id === parseInt(player2Id));
    
    if (!player1Character || !player2Character) {
        window.location.href = 'selection.html';
        return;
    }
    
    // Réinitialiser les points de vie et les utilisations des techniques
    resetCharacters();
    
    // Afficher les informations des personnages dans l'arène
    displayArenaInfo();
    
    // Configurer les boutons d'action
    setupActionButtons();
    
    // Initialiser l'état du jeu
    gameActive = true;
    currentPlayer = player1Character.speed >= player2Character.speed ? 1 : 2;
    opponent = currentPlayer === 1 ? 2 : 1;
    updateTurnIndicator();
    
    // Configurer les boutons de fin de jeu
    const playAgainBtn = document.getElementById('play-again-btn');
    const characterSelectBtn = document.getElementById('character-select-btn');
    
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', resetGame);
    }
    
    if (characterSelectBtn) {
        characterSelectBtn.addEventListener('click', () => {
            window.location.href = 'selection.html';
        });
    }
}

// Fonctions de la page de sélection
function selectCharacter(character) {
    // Déterminer quel joueur est en train de sélectionner
    const player1Selected = document.getElementById('player1-name').textContent !== 'Choisissez un personnage';
    const player2Selected = document.getElementById('player2-name').textContent !== 'Choisissez un personnage';
    
    let playerNumber = 1;
    
    if (player1Selected && !player2Selected) {
        playerNumber = 2;
    } else if (player1Selected && player2Selected) {
        // Si les deux joueurs ont déjà sélectionné, on remplace le joueur 1
        playerNumber = 1;
    }
    
    // Mettre à jour l'interface pour le joueur correspondant
    const playerName = document.getElementById(`player${playerNumber}-name`);
    const playerClass = document.getElementById(`player${playerNumber}-class`);
    const playerPortrait = document.getElementById(`player${playerNumber}-portrait`);
    const playerHealth = document.getElementById(`player${playerNumber}-health`);
    const playerPower = document.getElementById(`player${playerNumber}-power`);
    const playerDefense = document.getElementById(`player${playerNumber}-defense`);
    const playerSpeed = document.getElementById(`player${playerNumber}-speed`);
    const playerTechniques = document.getElementById(`player${playerNumber}-techniques`);
    const playerDescription = document.getElementById(`player${playerNumber}-description`);
    
    // Mettre à jour les informations du personnage
    playerName.textContent = character.name;
    playerClass.textContent = character.class;
    playerPortrait.src = character.images.portrait;
    playerHealth.style.width = `${(character.health / 150) * 100}%`;
    playerPower.style.width = `${(character.power / 10) * 100}%`;
    playerDefense.style.width = `${(character.defense / 10) * 100}%`;
    playerSpeed.style.width = `${(character.speed / 10) * 100}%`;
    playerDescription.textContent = character.description;
    
    // Afficher les techniques
    playerTechniques.innerHTML = '';
    character.techniques.forEach(technique => {
        const techElement = document.createElement('div');
        techElement.className = 'technique';
        techElement.innerHTML = `
            <span class="technique-name">${technique.name}</span>
            <span class="technique-damage">Dégâts: ${technique.damage}</span>
        `;
        playerTechniques.appendChild(techElement);
    });
    
    // Enregistrer la sélection du joueur
    if (playerNumber === 1) {
        player1Character = character;
    } else {
        player2Character = character;
    }
    
    // Activer le bouton de démarrage si les deux joueurs ont sélectionné
    const startButton = document.getElementById('start-button');
    if (player1Character && player2Character) {
        startButton.disabled = false;
    }
}

function startGame() {
    if (!player1Character || !player2Character) return;
    
    // Sauvegarder les sélections dans le localStorage
    localStorage.setItem('player1Character', player1Character.id);
    localStorage.setItem('player2Character', player2Character.id);
    
    // Rediriger vers la page de combat
    window.location.href = 'arena.html';
}

// Fonctions de la page d'arène
function displayArenaInfo() {
    // Afficher les informations du joueur 1
    document.getElementById('player1-name-arena').textContent = player1Character.name;
    document.getElementById('player1-class-arena').textContent = player1Character.class;
    document.getElementById('player1-image').src = player1Character.images.idle;
    document.getElementById('player1-health-bar').style.width = '100%';
    document.getElementById('player1-health-value').textContent = `${player1Character.health}/${player1Character.maxHealth}`;
    document.getElementById('player1-quote').textContent = player1Character.quote;
    
    // Afficher les informations du joueur 2
    document.getElementById('player2-name-arena').textContent = player2Character.name;
    document.getElementById('player2-class-arena').textContent = player2Character.class;
    document.getElementById('player2-image').src = player2Character.images.idle;
    document.getElementById('player2-health-bar').style.width = '100%';
    document.getElementById('player2-health-value').textContent = `${player2Character.health}/${player2Character.maxHealth}`;
    document.getElementById('player2-quote').textContent = player2Character.quote;
    
    // Gérer l'affichage des techniques
    updateTechniquesPanel();
}

function setupActionButtons() {
    const attackBtn = document.getElementById('attack-btn');
    const guardBtn = document.getElementById('guard-btn');
    const counterBtn = document.getElementById('counter-btn');
    
    attackBtn.addEventListener('click', () => performAction('attack'));
    guardBtn.addEventListener('click', () => performAction('guard'));
    counterBtn.addEventListener('click', () => performAction('counter'));
    
    // Les boutons des techniques seront configurés dynamiquement
    updateTechniquesPanel();
}

function updateTechniquesPanel() {
    const techniquesPanel = document.getElementById('techniques-buttons');
    techniquesPanel.innerHTML = '';
    
    const activeCharacter = currentPlayer === 1 ? player1Character : player2Character;
    
    activeCharacter.techniques.forEach((technique, index) => {
        const btn = document.createElement('button');
        btn.className = 'technique-btn';
        btn.disabled = technique.remainingUses <= 0;
        
        btn.innerHTML = `
            <span class="name">${technique.name}</span>
            <span class="damage">Dégâts: ${technique.damage}</span>
            <span class="uses">Utilisations: ${technique.remainingUses}/${technique.maxUses}</span>
        `;
        
        btn.addEventListener('click', () => performTechnique(index));
        techniquesPanel.appendChild(btn);
    });
}

function updateTurnIndicator() {
    document.getElementById('turn-indicator').textContent = `Tour ${turnCount}`;
    document.getElementById('current-player').textContent = `C'est au tour du ${currentPlayer === 1 ? 'Joueur 1' : 'Joueur 2'}`;
    
    // Mettre à jour le panel des techniques pour le joueur actuel
    updateTechniquesPanel();
}

function addBattleMessage(message, isHighlight = false) {
    const battleMessages = document.getElementById('battle-messages');
    const messageElement = document.createElement('p');
    
    if (isHighlight) {
        messageElement.className = 'highlight';
    }
    
    messageElement.textContent = message;
    battleMessages.appendChild(messageElement);
    
    // Faire défiler vers le bas pour voir le nouveau message
    battleMessages.scrollTop = battleMessages.scrollHeight;
}

// Fonctions de combat
function performAction(action) {
    if (!gameActive) return;
    
    const activeCharacter = currentPlayer === 1 ? player1Character : player2Character;
    const opposingCharacter = currentPlayer === 1 ? player2Character : player1Character;
    
    // Mettre à jour l'image en fonction de l'action
    const playerImage = document.getElementById(`player${currentPlayer}-image`);
    
    switch (action) {
        case 'attack':
            playerImage.src = activeCharacter.images.attack;
            
            // Calculer les dégâts
            const damage = calculateDamage(activeCharacter.power, opposingCharacter.defense, 15);
            
            // Appliquer les dégâts et mettre à jour l'interface
            applyDamage(damage, opponent);
            
            // Message de combat
            addBattleMessage(`${activeCharacter.name} attaque ${opposingCharacter.name} et inflige ${damage} dégâts!`);
            
            // Animations
            document.querySelector('.arena').classList.add('attacking');
            setTimeout(() => {
                document.querySelector('.arena').classList.remove('attacking');
                document.querySelector('.arena').classList.add('damaged');
                
                setTimeout(() => {
                    document.querySelector('.arena').classList.remove('damaged');
                }, 600);
            }, 600);
            
            // Mise à jour des statistiques
            if (currentPlayer === 1) {
                player1Stats.damageDealt += damage;
            } else {
                player2Stats.damageDealt += damage;
            }
            
            break;
            
        case 'guard':
            playerImage.src = activeCharacter.images.guard;
            
            // La garde réduit les dégâts reçus au prochain tour
            activeCharacter.isGuarding = true;
            
            // Message de combat
            addBattleMessage(`${activeCharacter.name} se met en position de garde!`);
            
            // Animation
            document.querySelector('.arena').classList.add('guarding');
            setTimeout(() => {
                document.querySelector('.arena').classList.remove('guarding');
            }, 600);
            
            break;
            
        case 'counter':
            playerImage.src = activeCharacter.images.counter;
            
            // Le contre permet de riposter si l'adversaire attaque au prochain tour
            activeCharacter.isCountering = true;
            
            // Message de combat
            addBattleMessage(`${activeCharacter.name} se prépare à contrer!`);
            
            // Animation
            document.querySelector('.arena').classList.add('countering');
            setTimeout(() => {
                document.querySelector('.arena').classList.remove('countering');
            }, 600);
            
            break;
    }
    
    // Enregistrer la dernière action
    lastAction = action;
    
    // Passer au tour suivant
    endTurn();
}

function performTechnique(techniqueIndex) {
    if (!gameActive) return;
    
    const activeCharacter = currentPlayer === 1 ? player1Character : player2Character;
    const opposingCharacter = currentPlayer === 1 ? player2Character : player1Character;
    const technique = activeCharacter.techniques[techniqueIndex];
    
    if (technique.remainingUses <= 0) return;
    
    // Utiliser la technique (réduire le nombre d'utilisations)
    technique.remainingUses--;
    
    // Mettre à jour l'image
    const playerImage = document.getElementById(`player${currentPlayer}-image`);
    playerImage.src = activeCharacter.images.attack;
    
    // Calculer les dégâts (les techniques ont leurs propres valeurs de dégâts)
    let damage = technique.damage;
    
    // Appliquer les dégâts
    applyDamage(damage, opponent);
    
    // Message de combat
    addBattleMessage(`${activeCharacter.name} utilise ${technique.name} sur ${opposingCharacter.name} et inflige ${damage} dégâts!`, true);
    
    // Animations
    document.querySelector('.arena').classList.add('attacking');
    setTimeout(() => {
        document.querySelector('.arena').classList.remove('attacking');
        document.querySelector('.arena').classList.add('damaged');
        
        setTimeout(() => {
            document.querySelector('.arena').classList.remove('damaged');
        }, 600);
    }, 600);
    
    // Mise à jour des statistiques
    if (currentPlayer === 1) {
        player1Stats.damageDealt += damage;
        player1Stats.techniquesUsed++;
    } else {
        player2Stats.damageDealt += damage;
        player2Stats.techniquesUsed++;
    }
    
    // Passer au tour suivant
    endTurn();
}

function calculateDamage(attackerPower, defenderDefense, baseDamage) {
    // Formule simple pour calculer les dégâts
    const damage = Math.max(5, Math.floor(baseDamage * (attackerPower / defenderDefense)));
    
    // Si le défenseur est en garde, les dégâts sont réduits
    const defendingCharacter = opponent === 1 ? player1Character : player2Character;
    if (defendingCharacter.isGuarding) {
        return Math.floor(damage / 2);
    }
    
    return damage;
}

function applyDamage(damage, targetPlayer) {
    const targetCharacter = targetPlayer === 1 ? player1Character : player2Character;
    
    // Si le personnage cible est en position de contre et que l'attaquant utilise une attaque
    if (targetCharacter.isCountering && lastAction === 'attack') {
        // Le contre réussit : l'attaquant subit des dégâts à la place
        addBattleMessage(`${targetCharacter.name} contre l'attaque!`, true);
        
        // Le contre inflige 75% des dégâts initiaux à l'attaquant
        const counterDamage = Math.floor(damage * 0.75);
        
        // L'attaquant devient la nouvelle cible
        const newTarget = currentPlayer;
        const newTargetCharacter = currentPlayer === 1 ? player1Character : player2Character;
        
        // Appliquer les dégâts à l'attaquant
        newTargetCharacter.health = Math.max(0, newTargetCharacter.health - counterDamage);
        
        // Mettre à jour la barre de vie et la valeur
        const healthBar = document.getElementById(`player${newTarget}-health-bar`);
        const healthValue = document.getElementById(`player${newTarget}-health-value`);
        
        healthBar.style.width = `${(newTargetCharacter.health / newTargetCharacter.maxHealth) * 100}%`;
        healthValue.textContent = `${newTargetCharacter.health}/${newTargetCharacter.maxHealth}`;
        
        // Message de combat
        addBattleMessage(`${targetCharacter.name} retourne ${counterDamage} dégâts à ${newTargetCharacter.name}!`);
        
        // Mise à jour des statistiques
        if (targetPlayer === 1) {
            player1Stats.damageDealt += counterDamage;
        } else {
            player2Stats.damageDealt += counterDamage;
        }
        
        // Vérifier si l'attaquant est KO
        if (newTargetCharacter.health <= 0) {
            endGame(targetPlayer); // L'adversaire gagne
            return;
        }
    } else {
        // Appliquer les dégâts normalement
        targetCharacter.health = Math.max(0, targetCharacter.health - damage);
        
        // Mettre à jour la barre de vie et la valeur
        const healthBar = document.getElementById(`player${targetPlayer}-health-bar`);
        const healthValue = document.getElementById(`player${targetPlayer}-health-value`);
        
        healthBar.style.width = `${(targetCharacter.health / targetCharacter.maxHealth) * 100}%`;
        healthValue.textContent = `${targetCharacter.health}/${targetCharacter.maxHealth}`;
        
        // Vérifier si le personnage cible est KO
        if (targetCharacter.health <= 0) {
            endGame(currentPlayer); // Le joueur actuel gagne
            return;
        }
    }
}

function endTurn() {
    // Réinitialiser certains états
    const activeCharacter = currentPlayer === 1 ? player1Character : player2Character;
    activeCharacter.isGuarding = false;
    activeCharacter.isCountering = false;
    
    // Changer de joueur
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    opponent = opponent === 1 ? 2 : 1;
    
    // Si on revient au joueur 1, c'est un nouveau tour
    if (currentPlayer === 1) {
        turnCount++;
    }
    
    // Réinitialiser l'image du joueur actif
    const playerImage = document.getElementById(`player${currentPlayer}-image`);
    const activeCharacterNew = currentPlayer === 1 ? player1Character : player2Character;
    playerImage.src = activeCharacterNew.images.idle;
    
    // Mettre à jour l'indicateur de tour
    updateTurnIndicator();
}

function endGame(winner) {
    gameActive = false;
    
    // Afficher le panneau de fin de jeu
    const gameOverPanel = document.getElementById('game-over-panel');
    const winnerText = document.getElementById('winner-text');
    const damageDealt = document.getElementById('damage-dealt');
    const techniquesUsed = document.getElementById('techniques-used');
    
    gameOverPanel.style.display = 'block';
    
    // Afficher les informations du gagnant
    const winnerName = winner === 1 ? player1Character.name : player2Character.name;
    const winnerStats = winner === 1 ? player1Stats : player2Stats;
    
    winnerText.textContent = `${winnerName} gagne!`;
    damageDealt.textContent = `Dégâts infligés: ${winnerStats.damageDealt}`;
    techniquesUsed.textContent = `Techniques utilisées: ${winnerStats.techniquesUsed}`;
    
    // Désactiver les boutons d'action
    document.querySelectorAll('.action-btn, .technique-btn').forEach(btn => {
        btn.disabled = true;
    });
}

function resetGame() {
    // Réinitialiser les personnages
    resetCharacters();
    
    // Réinitialiser les statistiques
    player1Stats = { damageDealt: 0, techniquesUsed: 0 };
    player2Stats = { damageDealt: 0, techniquesUsed: 0 };
    
    // Réinitialiser l'état du jeu
    turnCount = 1;
    gameActive = true;
    lastAction = null;
    currentPlayer = player1Character.speed >= player2Character.speed ? 1 : 2;
    opponent = currentPlayer === 1 ? 2 : 1;
    
    // Mettre à jour l'interface
    displayArenaInfo();
    updateTurnIndicator();
    
    // Masquer le panneau de fin de jeu
    document.getElementById('game-over-panel').style.display = 'none';
    
    // Réactiver les boutons d'action
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.disabled = false;
    });
    
    // Vider les messages de combat
    document.getElementById('battle-messages').innerHTML = '<p>Le combat recommence !</p>';
}

function resetCharacters() {
    // Réinitialiser les points de vie
    player1Character.health = player1Character.maxHealth;
    player2Character.health = player2Character.maxHealth;
    
    // Réinitialiser les utilisations des techniques
    player1Character.techniques.forEach(technique => {
        technique.remainingUses = technique.maxUses;
    });
    
    player2Character.techniques.forEach(technique => {
        technique.remainingUses = technique.maxUses;
    });
    
    // Réinitialiser les états spéciaux
    player1Character.isGuarding = false;
    player1Character.isCountering = false;
    player2Character.isGuarding = false;
    player2Character.isCountering = false;
}