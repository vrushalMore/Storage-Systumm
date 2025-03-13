import os

def print_directory_structure(start_path='.', indent=0):
    for item in os.listdir(start_path):
        item_path = os.path.join(start_path, item)
        print(' ' * indent + '|-- ' + item)
        if os.path.isdir(item_path):
            print_directory_structure(item_path, indent + 4)

print("Directory Structure:")
print_directory_structure(os.getcwd())
