import sys
import numpy as np
import copy
import random
import json

heuristic_board = [
    [50,  -50,  10,  5,  5, 10, -50,  50],
    [-50, -50,  10, -5, -5, 10, -50, -50],
    [10,   10,  50, 10, 10, 50,  10,  10],
    [5,    -5,  10,  7,  7, 10,  -5,   5],
    [5,    -5,  10,  7,  7, 10,  -5,   5],
    [10,   10,  50, 10, 10, 50,  10,  10],
    [-50, -50,  10, -5, -5, 10, -50, -50],
    [50,  -50,  10,  5,  5, 10, -50,  50],
]


def display_board(board):
    """
    :param board: board to display
    :return: prints out the board
    """
    for board_row in board:
        print(board_row)


def heuristic(board, player):
    """
    :param board: board to determine the width and height
    :param player: either player or opponent
    :return: adds up all the heuristic scores and returns the final score
    """
    result_score = 0
    opponent = 3 - player
    for i in range(len(board)):
        for j in range(len(board[i])):
            if board[i][j] == player:
                result_score += heuristic_board[i][j]
            elif board[i][j] == opponent:
                result_score -= heuristic_board[i][j]
    return result_score


def check_negative(move):
    """
    :param move: a move node
    :return: returns the heuristic score of a move
    """
    row, col = move.split(' ')
    return heuristic_board[int(row)][int(col)]


def score(board, player):
    """
    :param board: current board
    :param player: either player or opponent
    :return: number of tiles that the player/opponent has
    """
    count = 0
    for row in board:
        board_row = np.array(row)
        count += np.count_nonzero(board_row == player)
    return count

def utility(board, player):
    opponent = 3 - player
    score_difference = score(board, player) - score(board, opponent)
    if score_difference > 0:
        return 5
    elif score_difference < 0:
        return 0
    else:
        return 1

def update_board(board, move, player):
    """
    :param board: board to update
    :param move: a move node
    :param player: player or opponent
    :return: update the board (make a move) and return it
    """
    row, col = move.split(' ')
    updated_board = board
    updated_board[int(row)][int(col)] = player
    return updated_board


def player_tiles(board, player):
    """
    :param board: board to traverse
    :param player: player or opponent
    :return: list of tiles that a player currently has
    """
    list_of_player_tiles = []
    for i in range(len(board)):
        for j in range(len(board[i])):
            if board[i][j] == player:
                list_of_player_tiles.append([i, j])
    return list_of_player_tiles


def valid_moves(board, player):
    """
    :param board: board to traverse
    :param player: player or opponent
    :return: list of legal moves by checking up, down, left, right, and diagonally adjacent tiles
    """
    opponent = 3 - player
    legal_moves_list = {}
    current_tiles = player_tiles(board, player)
    for tile in current_tiles:
        row = tile[0]
        col = tile[1]
        # check up
        row_up = row - 1
        while row_up > 0 and board[row_up][col] == opponent:
            row_up = row_up - 1
            if board[row_up][col] == 0:
                legal_moves_list[str(row_up) + " " + str(col)] = {}
        # check down
        row_down = row + 1
        while row_down < 7 and board[row_down][col] == opponent:
            row_down = row_down + 1
            if board[row_down][col] == 0:
                legal_moves_list[str(row_down) + " " + str(col)] = {}

        # check left
        col_left = col - 1
        while col_left > 0 and board[row][col_left] == opponent:
            col_left = col_left - 1
            if board[row][col_left] == 0:
                legal_moves_list[str(row) + " " + str(col_left)] = {}

        # check right
        col_right = col + 1
        while col_right < 7 and board[row][col_right] == opponent:
            col_right = col_right + 1
            if board[row][col_right] == 0:
                legal_moves_list[str(row) + " " + str(col_right)] = {}

        # check top left
        row_diag_up = row - 1
        col_diag_left = col - 1
        while col_diag_left > 0 and row_diag_up > 0 and board[row_diag_up][col_diag_left] == opponent:
            row_diag_up = row_diag_up - 1
            col_diag_left = col_diag_left - 1
            if board[row_diag_up][col_diag_left] == 0:
                legal_moves_list[str(row_diag_up) + " " +
                                 str(col_diag_left)] = {}

        # check top right
        row_diag_up = row - 1
        col_diag_right = col + 1
        while col_diag_right < 7 and row_diag_up > 0 and board[row_diag_up][col_diag_right] == opponent:
            row_diag_up = row_diag_up - 1
            col_diag_right = col_diag_right + 1
            if board[row_diag_up][col_diag_right] == 0:
                legal_moves_list[str(row_diag_up) + " " +
                                 str(col_diag_right)] = {}

        # check bottom left
        row_diag_down = row + 1
        col_diag_left = col - 1
        while col_diag_left > 0 and row_diag_down < 7 and board[row_diag_down][col_diag_left] == opponent:
            row_diag_down = row_diag_down + 1
            col_diag_left = col_diag_left - 1
            if board[row_diag_down][col_diag_left] == 0:
                legal_moves_list[str(row_diag_down) + " " +
                                 str(col_diag_left)] = {}

        # check bottom right
        row_diag_down = row + 1
        col_diag_right = col + 1
        while col_diag_right < 7 and row_diag_down < 7 and board[row_diag_down][col_diag_right] == opponent:
            row_diag_down = row_diag_down + 1
            col_diag_right = col_diag_right + 1
            if board[row_diag_down][col_diag_right] == 0:
                legal_moves_list[str(row_diag_down) + " " +
                                 str(col_diag_right)] = {}
    dict_to_list = list(legal_moves_list.items())
    random.shuffle(dict_to_list)
    legal_moves_list = dict(dict_to_list)
    return legal_moves_list


def flip(current_board, move, player):
    """
    :param current_board: a board to update
    :param move: a move node
    :param player: player or opponent
    :return: the updated board with flipped tiles after making a move
    """
    board = current_board
    # move converted
    row, col = move.split(' ')
    row = int(row)
    col = int(col)

    # defining opponent
    opponent = 3 - player

    # top
    temp = []
    r = row - 1
    c = col
    while r > 0 and board[r][c] == opponent:
        temp.append([r, c])
        r = r - 1
        c = c
    if r >= 0 and board[r][c] == player:
        for x in temp:
            board[x[0]][x[1]] = player

    # bottom
    temp = []
    r = row + 1
    c = col
    while r < 7 and board[r][c] == opponent:
        temp.append([r, c])
        r = r + 1
        c = c
    if r <= 7 and board[r][c] == player:
        for x in temp:
            board[x[0]][x[1]] = player

    # left
    temp = []
    r = row
    c = col - 1
    while c > 0 and board[r][c] == opponent:
        temp.append([r, c])
        r = r
        c = c - 1
    if c >= 0 and board[r][c] == player:
        for x in temp:
            board[x[0]][x[1]] = player

    # right
    temp = []
    r = row
    c = col + 1
    while c < 7 and board[r][c] == opponent:
        temp.append([r, c])
        r = r
        c = c + 1
    if c <= 7 and board[r][c] == player:
        for x in temp:
            board[x[0]][x[1]] = player

    # top left diagonal
    temp = []
    r = row - 1
    c = col - 1
    while r > 0 and c > 0 and board[r][c] == opponent:
        temp.append([r, c])
        r = r - 1
        c = c - 1
    if r >= 0 and c >= 0 and board[r][c] == player:
        for x in temp:
            board[x[0]][x[1]] = player

    # top right diagonal
    temp = []
    r = row - 1
    c = col + 1
    while r > 0 and c < 7 and board[r][c] == opponent:
        temp.append([r, c])
        r = r - 1
        c = c + 1
    if r >= 0 and c <= 7 and board[r][c] == player:
        for x in temp:
            board[x[0]][x[1]] = player

    # bottom right diagonal
    temp = []
    r = row + 1
    c = col + 1
    while r < 7 and c < 7 and board[r][c] == opponent:
        temp.append([r, c])
        r = r + 1
        c = c + 1
    if r <= 7 and c <= 7 and board[r][c] == player:
        for x in temp:
            board[x[0]][x[1]] = player

    # bottom left diagonal
    temp = []
    r = row + 1
    c = col - 1
    while r < 7 and c > 0 and board[r][c] == opponent:
        temp.append([r, c])
        r = r + 1
        c = c - 1
    if r <= 7 and c >= 0 and board[r][c] == player:
        for x in temp:
            board[x[0]][x[1]] = player
    return board


def minimax(board, player, tree, level, upper_level_score, terminal_level):
    """
    :param board: the current state of the game (the board with the most recent move)
    :param player: the player that is about to make a move (in min levels it's the opponent)
    :param tree: the current tree with legal moves
    :param level: the current depth of the tree to determine whether it is min or max level
    :param upper_level_score: the score of the level above for pruning
    :param terminal_level: the overall terminal depth
    :return: the best node and the best score based on the algorithm
    """

    # worst case return the first move in the tree
    result_node = list(tree.keys())[0]
    opponent = 3 - player

    # terminal node level
    if level == terminal_level:
        # initial score of the node for max level
        the_score = -1000
        # initial score of the node for min level
        if level % 2 == 0:
            the_score = 1000
        # the worst case max node is result node
        max_node = result_node

        # go through the tree
        for terminal_node in tree:
            # check if the initial move is a bad position on the board based on heuristic
            if check_negative(terminal_node) < 0:
                tree[terminal_node] = check_negative(terminal_node) * 10000
                continue
            # copy the board to updated with potential move
            player_board = copy.deepcopy(board)
            player_board = update_board(player_board, terminal_node, player)
            player_board = flip(player_board, terminal_node, player)
            temp_score = 0
            # min level
            if level % 2 == 0:
                temp_score = heuristic(player_board, opponent)
                if len(valid_moves(player_board, player)) == 0 and len(valid_moves(player_board, opponent)) == 0:
                    temp_score *= utility(player_board, opponent)
                # remember the smallest score for min level
                if temp_score < the_score:
                    the_score = temp_score
                    max_node = terminal_node
                    # check if we can prune the rest of the moves
                    if upper_level_score != -1000 and the_score < upper_level_score:
                        break
            # max level
            else:
                temp_score = heuristic(player_board, player)
                if len(valid_moves(player_board, player)) == 0 and len(valid_moves(player_board, opponent)) == 0:
                    temp_score *= utility(player_board, player)
                # remember the highest score for max level
                if temp_score > the_score:
                    the_score = temp_score
                    # check if we can prune the rest of the moves
                    max_node = terminal_node
                    if upper_level_score != 1000 and the_score > upper_level_score:
                        break
            # update the tree with the score of the node
            tree[terminal_node] = temp_score
        # return the best node and its score so far
        return max_node, the_score
    # non-terminal nodes
    else:
        node_score = -1000
        # min level
        if level % 2 == 0:
            node_score = 1000
        # go through each move in the tree
        for node in tree:
            # stop exploring the node if it's the bad move by the heuristic board
            if check_negative(node) < 0:
                tree[node] = check_negative(node) * 10000
                continue
            # copy the board to updated with potential move
            player_board = copy.deepcopy(board)
            player_board = update_board(player_board, node, player)
            player_board = flip(player_board, node, player)

            # legal moves for the board after the move in the tree
            legal_moves = valid_moves(player_board, opponent)
            # expanding the tree
            tree[node] = legal_moves
            # min level
            if level % 2 == 0:
                # stop expanding the tree since it's doesn't have moves after
                if len(legal_moves) == 0:
                    tree[node] = heuristic(player_board, opponent)
                    continue
            # max level
            else:
                # stop expanding the tree since it's doesn't have moves after
                if len(legal_moves) == 0:
                    tree[node] = heuristic(player_board, player)
                    continue
            # recursively call function to explore the next level
            best_node, best_score = minimax(
                player_board, opponent, tree[node], level + 1, node_score, terminal_level)
            # assign the best score from the bottom level
            tree[node] = best_score
            # keep track the best score for this level
            if level % 2 == 0:
                if best_score < node_score:
                    node_score = best_score
                    result_node = node
                    if upper_level_score != -1000 and node_score < upper_level_score:
                        break
            else:
                if best_score > node_score:
                    node_score = best_score
                    result_node = node
                    if upper_level_score != 1000 and node_score > upper_level_score:
                        break
        return result_node, node_score


def convert_string_board(board):
    board_values = board.split(",")
    count = 0
    temp = []
    result_array = []
    for value in board_values:
        if count == 7:
            temp.append(int(value))
            result_array.append(temp)
            temp = []
            count = 0
        else:
            temp.append(int(value))
            count += 1
    return result_array


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print('Not enough arguments')
        exit(0)
    string_board = sys.argv[1]
    the_board = convert_string_board(string_board)
    the_player = int(sys.argv[2])
    if len(sys.argv) == 3:
        tree = valid_moves(the_board, the_player)
        if len(tree) == 0:
            print(json.dumps({"move": "8 8", "board": the_board}))
            exit(0)
        best_move, best_score = minimax(
            the_board, the_player, tree, 1, -1000, 6)
        the_board = update_board(the_board, best_move, the_player)
        the_board = flip(the_board, best_move, the_player)
        print(json.dumps({"move": best_move, "board": the_board}))
    elif len(sys.argv) == 4:
        the_move = sys.argv[3]
        the_board = update_board(the_board, the_move, the_player)
        the_board = flip(the_board, the_move, the_player)
        print(json.dumps({"board": the_board}))
