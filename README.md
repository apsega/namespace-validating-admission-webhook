# Namespace allowance Validating Admission WebHook

This is a Kubernetes Validating Admission WebHook that checks if a `namespace` resource is allowed to create pods on `nodes` that have special roles.

This is based on [Kelsey Hightower's denyenv validating admission webhook](https://github.com/kelseyhightower/denyenv-validating-admission-webhook)

## Getting started

In order to customize which namespaces are allowed to deploy on specifically labeled nodes change `namespaces_allowed` and `restricted_node_roles` in `index.js` file.

Build docker container:

```bash
docker build --rm -f "Dockerfile" -t namespace-allowance-admission-webhook:latest .
```

Change `${URL}` and `${CA_BUNDLE_BASE64}` in `namespace-validator.yaml` file:

* `${URL}` should point to newly build validating admission webhook. HTTPS protocol is mandatory.
* `${CA_BUNDLE_BASE64}` should be the CA of admission webhook's webserver encoded with base64

Apply `namespace-validator.yaml` manifest:

```bash
kubectl apply -f namespace-validator.yaml
```

## TBD

How to test.