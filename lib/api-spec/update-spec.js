const fs = require('fs');
const yaml = require('js-yaml');
const path = 'd:/Project/CRM website/lib/api-spec/openapi.yaml';
const doc = yaml.load(fs.readFileSync(path, 'utf8'));

// Add Roles
doc.paths['/roles'] = {
  get: { summary: 'List roles', operationId: 'listRoles', responses: { '200': { description: 'Success', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Role' } } } } } } },
  post: { summary: 'Create role', operationId: 'createRole', requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/RoleInput' } } } }, responses: { '201': { description: 'Success', content: { 'application/json': { schema: { $ref: '#/components/schemas/Role' } } } } } }
};
doc.paths['/roles/{id}'] = {
  put: { summary: 'Update role', operationId: 'updateRole', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/RoleInput' } } } }, responses: { '200': { description: 'Success', content: { 'application/json': { schema: { $ref: '#/components/schemas/Role' } } } } } },
  delete: { summary: 'Delete role', operationId: 'deleteRole', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '204': { description: 'Success' } } }
};

// Add Permissions
doc.paths['/permissions'] = {
  get: { summary: 'List permissions', operationId: 'listPermissions', responses: { '200': { description: 'Success', content: { 'application/json': { schema: { type: 'object', additionalProperties: { type: 'array', items: { $ref: '#/components/schemas/Permission' } } } } } } } }
};

delete doc.paths['/api/roles'];
delete doc.paths['/api/roles/{id}'];
delete doc.paths['/api/permissions'];

// Add Schemas
doc.components.schemas['Role'] = {
  type: 'object',
  properties: { id: { type: 'integer' }, name: { type: 'string' }, description: { type: 'string' }, isSystem: { type: 'boolean' }, createdAt: { type: 'string' }, permissions: { type: 'array', items: { type: 'string' } } },
  required: ['id', 'name', 'isSystem', 'createdAt', 'permissions']
};
doc.components.schemas['RoleInput'] = {
  type: 'object',
  properties: { name: { type: 'string' }, description: { type: 'string' }, permissions: { type: 'array', items: { type: 'string' } } },
  required: ['name']
};
doc.components.schemas['Permission'] = {
  type: 'object',
  properties: { id: { type: 'integer' }, permissionKey: { type: 'string' }, permissionName: { type: 'string' }, module: { type: 'string' }, description: { type: 'string' } },
  required: ['id', 'permissionKey', 'permissionName', 'module']
};

if (doc.components.schemas['User']) {
  doc.components.schemas['User'].properties.isActive = { type: 'boolean' };
  doc.components.schemas['User'].properties.roleId = { type: 'integer' };
}
if (doc.components.schemas['UserCreate']) {
  doc.components.schemas['UserCreate'].properties.isActive = { type: 'boolean' };
  doc.components.schemas['UserCreate'].properties.roleId = { type: 'integer' };
}
if (doc.components.schemas['UserUpdate']) {
  doc.components.schemas['UserUpdate'].properties.isActive = { type: 'boolean' };
  doc.components.schemas['UserUpdate'].properties.roleId = { type: 'integer' };
}

fs.writeFileSync(path, yaml.dump(doc));
console.log('OpenAPI spec updated');
