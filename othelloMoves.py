import random
import sys
import json

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
    legal = valid_moves(the_board, the_player)
    print(json.dumps(legal))
