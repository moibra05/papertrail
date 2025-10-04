export const folderSchema = {
  name: "Folder",
  type: "object",
  properties: {
    name: {
      type: "string",
      description: "Name of the folder",
    },
    description: {
      type: "string",
      description: "Description of the folder purpose",
    },
    color: {
      type: "string",
      description: "Hex color code for folder identification",
      default: "#6366F1",
    },
  },
  required: ["name"],
};
