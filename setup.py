# coding=utf-8
import os
from setuptools import setup

setup(
    name='drfbro',
    version='0.0.1',
    description='drfbro - a better Django REST Framework browser.',
    long_description="""drfbro
======

What is this?
=============

This is a Django extension that provides a better Django REST Framework browser.

See https://github.com/and3rson/drfbro for more info.
""",
    author="Andrew Dunai",
    author_email='andrew@dun.ai',
    url='https://github.com/and3rson/drfbro',
    license='MIT',
    packages=['drfbro'],
    include_package_data=True,
    install_requires=['setuptools'],
    zip_safe=False,
    classifiers=[
        'Development Status :: 5 - Production/Stable',
        'Environment :: Web Environment',
        'Framework :: Django',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
    ],
    keywords='django,rest,framework,drf,restframework,browser,navigator',
)
